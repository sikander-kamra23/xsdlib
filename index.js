let parser = require("fast-xml-parser");
let format = require("xml-formatter");
let toJsonSchema = require("to-json-schema");
let beautify = require("json-beautify");
let _ = require("lodash");
const { some } = require("lodash");

let primaryAttributes = ["minLength", "maxLength", "default", "pattern", "type", "enum", "properties", "format", "required", "enumDesc", "exclusiveMinimum", "exclusiveMaximum", "minimum", "maximum", "uniqueItems", "minItems", "maxItems", "isArray"];

const generateExtraTypes = (keysExtra, valuesExtra, key) => {
   let xmlExtraTypes = "";
   let minLengthIndex = keysExtra.indexOf("minLength");
   let minLength = "";

   let maxLengthIndex = keysExtra.indexOf("maxLength");
   let maxLength = "";

   let typeIndex = keysExtra.indexOf("type");
   let type = valuesExtra[typeIndex];

   if (minLengthIndex !== -1) {
      minLength = `<xs:minLength value="${valuesExtra[minLengthIndex]}"/>`;
   }

   if (maxLengthIndex !== -1) {
      maxLength = `<xs:maxLength value="${valuesExtra[maxLengthIndex]}"/>`;
   }

   if (minLengthIndex !== -1 || maxLengthIndex !== -1) {
      xmlExtraTypes += `<xs:simpleType name="${key}Type">`;
      xmlExtraTypes += `<xs:restriction base="xs:${type}">`;
      xmlExtraTypes += minLength;
      xmlExtraTypes += maxLength;
      xmlExtraTypes += `</xs:restriction>`;
      xmlExtraTypes += `</xs:simpleType>`;
   }
   return xmlExtraTypes;
};

const generateComplexTypes = (keysExtra, valuesExtra, key, type) => {
   let minLengthIndex = keysExtra.indexOf("minLength");
   let maxLengthIndex = keysExtra.indexOf("maxLength");
   let defaultIndex = keysExtra.indexOf("default");

   let keysExtra2 = []; //keysExtra.slice();
   let valuesExtra2 = []; //valuesExtra.slice();

   keysExtra.forEach((k, index) => {
      if (primaryAttributes.indexOf(k) === -1) {
         keysExtra2.push(k);
         valuesExtra2.push(valuesExtra[index]);
      }
   });

   let baseAttr = "";
   let defaultAttr = "";

   if (minLengthIndex !== -1 || maxLengthIndex !== -1) {
      baseAttr = `base="${key}Type"`;
   }

   if (defaultIndex !== -1) {
      defaultAttr = `default="${valuesExtra[defaultIndex]}"`;
   }

   let xml = "";
   let isArray = keysExtra.indexOf("isArray") !== -1 ? `maxOccurs="unbounded"` : "";
   if (keysExtra.length === 2 && keysExtra.indexOf("isArray") !== -1) {
      xml += `<xs:element ${isArray} type="xs:${type}" ${defaultAttr} name="${key}" />`;
   } else {
      xml += `<xs:element ${isArray} type="xs:${type}" ${defaultAttr} name="${key}"><xs:complexType><xs:simpleContent><xs:extension ${baseAttr}>`;
      keysExtra2.forEach((d, index) => {
         xml += `<xs:attribute default="${valuesExtra2[index]}" name="${d.replace("attribute_", "")}" type="xs:string"/>`;
      });
      xml += `</xs:extension></xs:simpleContent></xs:complexType></xs:element>`;
   }

   return xml;
};

const convertToObj = arrayObj => {
   let obj = {};
   let arrayObjParams = arrayObj;
   let arrayObjItems = arrayObjParams.items;
   if (arrayObjParams.type === "array") {
      if (!Array.isArray(arrayObjItems)) {
         arrayObjItems = [arrayObjParams.items];
      }
      obj.type = "object";
      if (Array.isArray(arrayObjItems)) {
         let commonObjKeys = {};
         arrayObjItems.forEach(dObj => {
            if (dObj.type === "object") {
               Object.keys(dObj.properties).forEach(d1 => {
                  if (Object.keys(commonObjKeys).indexOf(d1) === -1) {
                     if (dObj.properties[d1].type === "object") {
                        Object.keys(dObj.properties).forEach(d2 => {
                           if (dObj.properties[d2].type === "array") {
                              dObj.properties[d2] = convertToObj(dObj.properties[d2]);
                           }
                        });
                        commonObjKeys[d1] = dObj.properties[d1];
                     } else if (dObj.properties[d1].type === "array") {
                        commonObjKeys[d1] = convertToObj(dObj.properties[d1]);
                     } else {
                        commonObjKeys[d1] = dObj.properties[d1];
                     }
                  }
               });
               obj.properties = commonObjKeys;
               obj.isArray = true;
            } else {
               obj = dObj;
               obj.isArray = true;
            }
         });
      } else {
         obj = arrayObjItems;
         obj.isArray = true;
      }
   }
   return obj;
};

const generateObj = (keys, values, hasParent = true, name = "", { keysExtra, valuesExtra } = { keysExtra: [], valuesExtra: [] }) => {
   let xml = "";
   let xmlExtraTypes = "";
   let attributes = [];
   if (!hasParent) {
      keys.forEach((k, i) => {
         if (k.indexOf("attribute_") !== -1) {
            attributes.push(k);
            delete keys[i];
            delete values[i];
         }
      });
      if (attributes.length > 0 && keys.indexOf("extension") !== -1) {
         xml += `<xs:complexType>`;
         xml += ` <xs:simpleContent>`;
      } else {
         xml += `<xs:complexType>`;
         xml += `<xs:sequence>`;
      }
   }

   if (keys.indexOf("type") === -1) {
      keys.forEach((d, key) => {
         let type = values[key].type;
         if (type === "object") {
            let obj = values[key];
            let keys2 = Object.keys(obj.properties);
            let values2 = Object.values(obj.properties);
            let keysExtra = Object.keys(obj);
            let valuesExtra = Object.values(obj);
            xml += `<xs:element name="${keys[key]}">`;
            xml += generateObj(keys2, values2, false, null, {
               keysExtra,
               valuesExtra
            }).xml;
            xml += `</xs:element>`;
         } else if (type === "array") {
            let obj = convertToObj(values[key]);
            if (obj.properties) {
               let keys2 = Object.keys(obj.properties);
               let values2 = Object.values(obj.properties);
               let keysExtra = Object.keys(obj);
               let valuesExtra = Object.values(obj);
               xml += `<xs:element maxOccurs="unbounded" name="${keys[key]}">`;
               xml += generateObj(keys2, values2, false, null, {
                  keysExtra,
                  valuesExtra
               }).xml;
               xml += `</xs:element>`;
            } else {
               xml += `<xs:element maxOccurs="unbounded" type="xs:${obj.type}" name="${keys[key]}" />`;
            }
         } else if (typeof type === "string" && type.length > 0) {
            let keysExtra = Object.keys(values[key]);
            let valuesExtra = Object.values(values[key]);

            let defaultInline = "";
            if (keysExtra.indexOf("default") !== -1) {
               defaultInline = `default="${values[key].default}"`;
            }

            if (keysExtra.length > 1 && !(keysExtra.length === 2 && keysExtra[1] === "default")) {
               xmlExtraTypes += generateExtraTypes(keysExtra, valuesExtra, keys[key]);
               xml += generateComplexTypes(keysExtra, valuesExtra, keys[key], type);
            } else {
               if (keys[key] !== "extension") {
                  xml += `<xs:element ${defaultInline} type="xs:${type}" name="${keys[key]}"/>`;
               } else {
                  if (attributes.length > 0) {
                     xml += `<xs:extension base="xs:${type}">`;
                     attributes.forEach(d => {
                        xml += `<xs:attribute name="${d.replace("attribute_", "")}" type="xs:string"/>`;
                     });
                     xml += `</xs:extension>`;
                  } else {
                     xml += `<xs:extension base="xs:${type}"/>`;
                  }
               }
            }
         }
      });
   } else {
      let type = values[keys.indexOf("type")];
      let defaultInline = "";
      if (keys.indexOf("default") !== -1) {
         defaultInline = `default="${values[keys.indexOf("default")]}"`;
      }

      let keysExtra = keys;
      let valuesExtra = values;
      if (type === "string" && keys.length === 1) {
         xml += `<xs:element ${defaultInline} type="xs:${type}" name="${name}_item"/>`;
      } else if (type === "string" && keys.length > 1) {
         xmlExtraTypes += generateExtraTypes(keysExtra, valuesExtra, name);
         xml += generateComplexTypes(keysExtra, valuesExtra, name, type);
      }
   }

   if (!hasParent) {
      keysExtra.forEach(d => {
         if (primaryAttributes.indexOf(d) === -1) {
            attributes.push(d);
         }
      });

      if (attributes.length > 0 && keys.indexOf("extension") !== -1) {
         xml += ` </xs:simpleContent>`;
         xml += `</xs:complexType>`;
      } else {
         xml += `</xs:sequence>`;
         if (attributes.length > 0) {
            attributes.forEach((attr, index) => {
               if (attr.indexOf("xsi") === -1) {
                  let defaultval = valuesExtra[keysExtra.indexOf(attr)] ? `default="${valuesExtra[keysExtra.indexOf(attr)]}"` : "";
                  xml += `<xs:attribute name="${attr.replace("attribute_", "")}" ${defaultval} type="xs:string"/>`;
               }
            });
         }
         xml += `</xs:complexType>`;
      }
   }

   return { xml, xmlExtraTypes };
};

const OBJtoXSDElement = obj => {
   let xml = `<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">`;
   let xmlExtraTypes = ``;
   let type = obj.type;

   let rootKeys = Object.keys(obj);
   let rootValues = Object.values(obj);

   let i1 = rootKeys.indexOf("type");
   let i2 = rootKeys.indexOf("properties");

   delete rootKeys[i1] && rootValues[i1];
   delete rootKeys[i2] && rootValues[i2];

   if (type === "object") {
      let keys = Object.keys(obj.properties);
      let values = Object.values(obj.properties);
      let keysExtra = Object.keys(obj);
      let valuesExtra = Object.values(obj);

      if (keys.length > 1) {
         let title = "";
         let description = "";

         if (obj.title) {
            title = `title="${obj.title}"`;
         }

         if (obj.description) {
            description = `description="${obj.description}"`;
         }

         xml += `<xs:element ${title} ${description} name="root">`;
         xml += `<xs:complexType>`;
         xml += `<xs:sequence>`;
      }
      let xmlObj = generateObj(keys, values, true, null, {
         keysExtra,
         valuesExtra
      });
      xmlExtraTypes = xmlObj.xmlExtraTypes;
      xml += xmlObj.xml;
      if (keys.length > 1) {
         xml += `</xs:element>`;
         xml += `</xs:sequence>`;
         xml += `</xs:complexType>`;
      }
   }
   xml += xmlExtraTypes;
   rootKeys.forEach((d, index) => {
      xml += `<xs:attribute default="${rootValues[index]}" name="${d}" type="xs:string"/>`;
   });
   xml += `</xs:schema>`;
   xml = xml.replace(/<\/?[0-9]{1,}>/g, "");
   return xml;
};

const generateSimpleContent = (d, coma = false, restrictions = {}) => {
   let jsonString = "";
   let ext = d["xs:simpleContent"]["xs:extension"];
   let attr = ext["xs:attribute"];
   let attrJson = "";
   let minLength = "";
   let maxLength = "";

   let type = d.attribute_type ? d.attribute_type : ext.attribute_base;

   if (Array.isArray(attr)) {
      attrJson = attr.length > 0 ? `,${attr.map(a => `"${a.attribute_name}":"${a.attribute_default || ""}"`)}` : "";
   } else if (attr.attribute_name) {
      attrJson = `,"${attr.attribute_name}":"${attr.attribute_default || ""}"`;
   }

   if (ext.attribute_base) {
      if (restrictions[ext.attribute_base]) {
         let minLength = restrictions[ext.attribute_base] && restrictions[ext.attribute_base]["xs:minLength"] && restrictions[ext.attribute_base]["xs:minLength"]["attribute_value"];
         let maxLength = restrictions[ext.attribute_base] && restrictions[ext.attribute_base]["xs:maxLength"] && restrictions[ext.attribute_base]["xs:maxLength"]["attribute_value"];
         if (minLength) attrJson += `,"minLength":"${minLength}"`;
         if (maxLength) attrJson += `,"maxLength":"${maxLength}"`;
      }
   }
   jsonString += `"${d.attribute_name}":{"type":"${type.replace("xs:", "")}"${attrJson}}${coma ? "," : ""}`;
   return jsonString;
};

const generateJson = (keys, values, restrictions = {}, attributes = []) => {
   let jsonString = ``;
   let keyIndex = keys.indexOf("attribute_name");
   let complexTypeIndex = keys.indexOf("xs:complexType");

   if (complexTypeIndex !== -1) {
      if (values[complexTypeIndex]["xs:sequence"]) {
         let keys2 = Object.keys(values[complexTypeIndex]["xs:sequence"]["xs:element"]);
         let values2 = Object.values(values[complexTypeIndex]["xs:sequence"]["xs:element"]);
         attributes.forEach((d, i) => {
            if (typeof d === "undefined") {
               attributes.splice(i, 1);
            }
         });

         jsonString += `{"${values[keyIndex]}":{"type":"object","properties":${generateJson(keys2, values2, restrictions)}${attributes.length > 0 ? "," : ""}${attributes.map((d, i) => (d ? `"${d.attribute_name}":"${d.attribute_default || ""}"` : ""))}}}`;
      } else {
         jsonString += `{"${values[keyIndex]}":{"type":"object","properties":{}}}`;
      }
   } else {
      jsonString += "{";
      if (values.length === 2 && typeof values[0] === "string") {
         jsonString += `"${values[1]}":{"type":"${values[0].replace("xs:", "")}"}`;
      } else {
         if (keys.indexOf("xs:simpleContent") !== -1) {
            let obj = {};
            keys.forEach(d => {
               obj[d] = values[keys.indexOf(d)];
            });
            jsonString += generateSimpleContent(obj, null, restrictions);
         } else {
            values.forEach((d, index) => {
               let coma = index !== values.length - 1;
               if (d["xs:complexType"] && d["xs:complexType"]["xs:sequence"]) {
                  let keys2 = Object.keys(d["xs:complexType"]["xs:sequence"]);
                  let values2 = Object.values(d["xs:complexType"]["xs:sequence"]);
                  let maxBound = d.attribute_maxOccurs === "unbounded";
                  let extraAttributeKey = Object.keys(d["xs:complexType"]);
                  let extraAttributeValue = Object.values(d["xs:complexType"]);

                  let attributeJson = "";

                  if (extraAttributeKey.indexOf("xs:attribute") !== -1) {
                     let items = extraAttributeValue[extraAttributeKey.indexOf("xs:attribute")];
                     if (Array.isArray(items)) {
                        items.map(d => {
                           attributeJson += `,"${d.attribute_name}":"${d.attribute_default || ""}"`;
                        });
                     }
                  }

                  if (maxBound) {
                     jsonString += `"${d.attribute_name}":{"type":"array"${attributeJson},"items":{"type":"object","properties":${generateJson(keys2, values2, restrictions)}}${coma ? "," : ""}}`;
                  } else {
                     let extraAttributeKey = Object.keys(d["xs:complexType"]);
                     let extraAttributeValue = Object.values(d["xs:complexType"]);

                     let attributeJson = "";

                     if (extraAttributeKey.indexOf("xs:attribute") !== -1) {
                        let items = extraAttributeValue[extraAttributeKey.indexOf("xs:attribute")];
                        if (Array.isArray(items)) {
                           items.map(d => {
                              attributeJson += `,"${d.attribute_name}":"${d.attribute_default || ""}"`;
                           });
                        }
                     }

                     jsonString += `"${d.attribute_name}":{"type":"object"${attributeJson},"properties":${generateJson(keys2, values2, restrictions)}}${coma ? "," : ""}`;
                  }
               } else if (Array.isArray(d)) {
                  d.forEach((d1, index) => {
                     let coma2 = index !== d.length - 1;
                     if (d1["xs:simpleContent"]) {
                        jsonString += generateSimpleContent(d1, coma2, restrictions);
                     } else if (d1["xs:complexType"] && d1["xs:complexType"]["xs:simpleContent"]) {
                        d1["xs:complexType"].attribute_name = d1.attribute_name;
                        jsonString += generateSimpleContent(d1["xs:complexType"], coma2, restrictions);
                     } else if (d1["xs:complexType"]) {
                        let keys2 = Object.keys(d1["xs:complexType"]["xs:sequence"]);
                        let values2 = Object.values(d1["xs:complexType"]["xs:sequence"]);
                        jsonString += `"${d1.attribute_name}":{"type":"object","properties":${generateJson(keys2, values2, restrictions)}}${coma2 ? "," : ""}`;
                     } else {
                        let maxBound = d1.attribute_maxOccurs === "unbounded";
                        if (maxBound) {
                           if (!d1.attribute_ref) {
                              jsonString += `"${d1.attribute_name}":{"type":"array","items":{"type":"${d1.attribute_type.replace("xs:", "")}"}}${coma2 ? "," : ""}`;
                           }
                        } else {
                           if (!d1.attribute_ref) {
                              jsonString += `"${d1.attribute_name}":{"type":"${d1.attribute_type.replace("xs:", "")}"}${coma2 ? "," : ""}`;
                           }
                        }
                     }
                  });
               } else if (d["xs:complexType"] && d["xs:complexType"]["xs:simpleContent"]) {
                  d["xs:complexType"].attribute_name = d.attribute_name;
                  jsonString += generateSimpleContent(d["xs:complexType"], coma, restrictions);
               } else if (d["xs:simpleContent"]) {
                  jsonString += generateSimpleContent(d, coma, restrictions);
               } else if (d.attribute_name && d.attribute_type) {
                  if (d.attribute_maxOccurs) {
                     jsonString += `"${d.attribute_name}":{"type":"array","items":{"type":"${d.attribute_type.replace("xs:", "")}"}}${coma ? "," : ""}`;
                  } else {
                     jsonString += `"${d.attribute_name}":{"type":"${d.attribute_type.replace("xs:", "")}"}${coma ? "," : ""}`;
                  }
               }
            });
         }
      }
      jsonString += `}`;
   }
   return jsonString;
};

const xmlSchemaOBJtoJsonSchema = jsonObj => {
   let jsonString = "";
   jsonString += `{"type":"object","properties":`;
   let parentObj = jsonObj["xs:schema"];
   let mainKeys = Object.keys(parentObj);
   let mainValues = Object.values(parentObj);
   let restrictions = {};
   mainKeys.forEach((key, index) => {
      if (key === "xs:simpleType") {
         restrictions[mainValues[index].attribute_name] = mainValues[index]["xs:restriction"];
      }
   });
   if (parentObj) {
      let mainObj = parentObj["xs:element"];
      let attributes = mainObj["xs:complexType"] && mainObj["xs:complexType"]["xs:attribute"];
      if (mainObj) {
         let keys = Object.keys(mainObj);
         let values = Object.values(mainObj);

         if (keys.length >= 2) {
            if (!Array.isArray(attributes)) attributes = [attributes];
            jsonString += generateJson(keys, values, restrictions, attributes);
         }
      } else {
         jsonString += `{}`;
      }
   }
   jsonString += `}`;
   let json = JSON.parse(jsonString);
   return json.properties && json.properties.root ? json.properties.root : json;
};

const simplifyJson = jsonObj => {
   const schema = jsonObj["xs:schema"];

   const getObjType = (nametype, name, otherProps) => {
      let itemObj;
      let itemKey;

      let simpleTypes = schema["xs:simpleType"];
      let complexTypes = schema["xs:complexType"];

      if (complexTypes && !complexTypes.length) complexTypes = [complexTypes]
      if (simpleTypes && !simpleTypes.length) simpleTypes = [simpleTypes]


      complexTypes.forEach(d => {
         if (d.attribute_name === nametype) {
            // delete d.attribute_name
            itemObj = d;
            itemKey = "xs:complexType";
         }
      });

      if (!itemObj && simpleTypes && simpleTypes.length) {
         simpleTypes.forEach(d => {
            if (d.attribute_name === nametype) {
               itemObj = d;
               itemKey = "xs:simpleType";
            }
         });
      }

      if (!itemKey && !itemObj) {
         return null;
      }


      if (itemKey === "xs:complexType") {
         itemObj["xs:sequence"]["xs:element"] = renderElements(itemObj["xs:sequence"]["xs:element"]);
         let l = { attribute_name: name, [itemKey]: itemObj };
         Object.keys(otherProps).forEach(d => {
            l[d] = otherProps[d];
         });
         return l;
      }

      if (itemKey === "xs:simpleType") {
         itemObj = renderSimpleType(itemObj, name);
         return itemObj;
      }
   };

   const renderSimpleType = (item, name) => {
      if (item["xs:restriction"]) {
         const obj = item["xs:restriction"];
         return { attribute_name: name, attribute_type: obj.attribute_base };
      }
   };

   const renderElements = elements => {
      elements.forEach((d, index) => {
         if (d['xs:complexType']) {
            let elements2 = d['xs:complexType']['xs:sequence']['xs:element']
            if (elements2 && !elements2.length) elements2 = [elements2]
            elements[index]['xs:complexType']['xs:sequence']['xs:element'] = renderElements(elements2);
         }
         if (d.attribute_type && (d.attribute_type.toLowerCase().includes("type") || !d.attribute_type.toLowerCase().includes("xs:"))) {
            let n = getObjType(d.attribute_type, d.attribute_name, d);
            if (n !== null) {
               elements[index] = n;
            } else {
               delete elements[index];
            }
         }
      });

      return elements;
   };


   const obj = renderElements([schema["xs:element"]])[0];
   // console.log(beautify((obj), null, 2, 100));

   return {
      "xs:schema": {
         "attribute_xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
         attribute_attributeFormDefault: "unqualified",
         attribute_elementFormDefault: "qualified",
         "attribute_xmlns:xs": "http://www.w3.org/2001/XMLSchema",
         "xs:element": obj
      }
   };
};


const convertRefType = (jsonObj) => {
   const schema = jsonObj["xs:schema"];
   const allElements = schema['xs:element']
   let allAttributes = schema['xs:attribute']
   if (allAttributes && !allAttributes.length) allAttributes = [allAttributes]

   const renderElements = (elements) => {
      elements.forEach((d, index) => {
         if (d['xs:complexType']) {
            const elements = d['xs:complexType']['xs:sequence']['xs:element']
            d['xs:complexType']['xs:sequence']['xs:element'] = renderElements(elements)

            let attributes = d['xs:complexType']['xs:attribute']
            if (attributes && !attributes.length) attributes = [attributes]
            if (attributes) {
               attributes.forEach((attr, aIndex) => {
                  const ref = attr.attribute_ref
                  if (ref) {
                     let attributeItem = allAttributes.find(d => d.attribute_name === ref)
                     attributes[aIndex] = attributeItem
                  }
               })
               d['xs:complexType']['xs:attribute'] = attributes
            }
         }


         if (d['attribute_ref']) {
            const ref = d['attribute_ref']
            const refElement = allElements.find(d => d.attribute_name === ref)

            Object.keys(d).forEach(k => {
               if (k !== 'attribute_ref') {
                  refElement[k] = d[k]
               }
            })

            elements[index] = refElement
         }

      })
      return elements
   }

   const updateElements = renderElements(allElements)
   const mainElement = updateElements[updateElements.length - 1]

   // console.log(beautify((mainElement), null, 2, 100));

   return {
      "xs:schema": {
         "attribute_xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
         attribute_attributeFormDefault: "unqualified",
         attribute_elementFormDefault: "qualified",
         "attribute_xmlns:xs": "http://www.w3.org/2001/XMLSchema",
         "xs:element": mainElement
      }
   };
}

exports.xml2xsd = xmlString => {
   let jsonObj = parser.parse(xmlString, {
      ignoreAttributes: false,
      textNodeName: "extension",
      attributeNamePrefix: "attribute_"
   });
   let newSchema = (schema, type) => {
      schema.type = type;
      return schema;
   };
   let options = {
      arrays: { mode: "tuple" },
      postProcessFnc: (type, schema, value, defaultFunc) => (type === "number" ? newSchema(schema, "integer") : defaultFunc(type, schema, value))
   };
   let schema = toJsonSchema(jsonObj, options);
   return format(OBJtoXSDElement(schema));
};

exports.json2xsd = jsonObj => {
   let schema = toJsonSchema(jsonObj);
   return format(OBJtoXSDElement(schema));
};

exports.jsonSchema2xsd = jsonSchema => {
   return format(OBJtoXSDElement(jsonSchema));
};

exports.xsd2jsonSchema = xsdString => {
   try{
   xsdString = xsdString.split("xsd:").join("xs:");
   xsdString = xsdString.split("tns:").join("");

   let isRefType = false;

   if (xsdString.includes("ref=")) {
      isRefType = true
   }

   let jsonObj = parser.parse(xsdString, {
      ignoreAttributes: false,
      attributeNamePrefix: "attribute_"
   });

   if (isRefType) {
      jsonObj = convertRefType(jsonObj)
   }

   // console.log(beautify((jsonObj), null, 2, 100))

   jsonObj = simplifyJson(jsonObj);
   return beautify(xmlSchemaOBJtoJsonSchema(jsonObj), null, 2, 100);
}catch(err){
   console.log("error: Invalid XSD Schema")
}
};

exports.validateXml = string => {
   let response = parser.validate(string);
   if (response === true) {
      return true;
   } else {
      throw response.err;
   }
};

exports.detectXmlSchema = string => {
   if (parser.validate(string) === true) {
      if (string.endsWith("</xs:schema>")) {
         return "xsd";
      } else return "xml";
   } else throw parser.validate(string).err;
};
