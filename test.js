const { xsd2jsonSchema, json2xsd, jsonSchema2xsd, xml2xsd, xml2json } = require('.')
const { json2xml } = require('./json2xml')
let beautify = require('json-beautify')
test("process xsd", () => {
    const test = `<Invoice xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
    <cbc:CustomizationID>
        urn:cen.eu:en16931:2017#conformant#urn:fdc:peppol.eu:2017:poacc:billing:international:aunz:3.0
    </cbc:CustomizationID>
    <cbc:ProfileID>
        urn:fdc:peppol.eu:2017:poacc:billing:01:1.0
    </cbc:ProfileID>
    <cbc:ID>
        The ID
    </cbc:ID>
    <cbc:IssueDate>
        2019-07-29
    </cbc:IssueDate>
    <cbc:DueDate>
        2019-08-30
    </cbc:DueDate>
    <cbc:InvoiceTypeCode>
        380
    </cbc:InvoiceTypeCode>
    <cbc:Note>
        Some Blurb about the Invoice
    </cbc:Note>
    <cbc:DocumentCurrencyCode>
        AUD
    </cbc:DocumentCurrencyCode>
    <cbc:AccountingCost>
        4025:123:4343
    </cbc:AccountingCost>
    <cbc:BuyerReference>
        0150abc
    </cbc:BuyerReference>
    <cac:InvoicePeriod>
        <cbc:StartDate>
            2019-06-01
        </cbc:StartDate>
        <cbc:EndDate>
            2019-07-30
        </cbc:EndDate>
        <cbc:DescriptionCode>
            432
        </cbc:DescriptionCode>
    </cac:InvoicePeriod>
    <cac:OrderReference>
        <cbc:ID>
            PurchaseOrderReference
        </cbc:ID>
        <cbc:SalesOrderID>
            12345678
        </cbc:SalesOrderID>
    </cac:OrderReference>
    <cac:BillingReference>
        <cac:InvoiceDocumentReference>
            <cbc:ID>
                PrecedingInvoiceReference
            </cbc:ID>
            <cbc:IssueDate>
                2019-07-30
            </cbc:IssueDate>
        </cac:InvoiceDocumentReference>
    </cac:BillingReference>
    <cac:DespatchDocumentReference>
        <cbc:ID>
            DDR-REF
        </cbc:ID>
    </cac:DespatchDocumentReference>
    <cac:ReceiptDocumentReference>
        <cbc:ID>
            RD-REF
        </cbc:ID>
    </cac:ReceiptDocumentReference>
    <cac:OriginatorDocumentReference>
        <cbc:ID>
            OD-REF
        </cbc:ID>
    </cac:OriginatorDocumentReference>
    <cac:ContractDocumentReference>
        <cbc:ID>
            CD-REF
        </cbc:ID>
    </cac:ContractDocumentReference>
    <cac:ProjectReference>
        <cbc:ID>
            PR-REF
        </cbc:ID>
    </cac:ProjectReference>
    <cac:AccountingSupplierParty>
        <cac:Party>
            <cbc:EndpointID schemeID="0151">
                47555222000
            </cbc:EndpointID>
            <cac:PartyIdentification>
                <cbc:ID>
                    47555222000
                </cbc:ID>
            </cac:PartyIdentification>
            <cac:PartyName>
                <cbc:Name>
                    Supplier Trading Name Ltd
                </cbc:Name>
            </cac:PartyName>
            <cac:PostalAddress>
                <cbc:StreetName>
                    Main street 1
                </cbc:StreetName>
                <cbc:AdditionalStreetName>
                    Postbox 123
                </cbc:AdditionalStreetName>
                <cbc:CityName>
                    Harrison
                </cbc:CityName>
                <cbc:PostalZone>
                    2912
                </cbc:PostalZone>
                <cac:Country>
                    <cbc:IdentificationCode>
                        AU
                    </cbc:IdentificationCode>
                </cac:Country>
            </cac:PostalAddress>
            <cac:PartyTaxScheme>
                <cbc:CompanyID>
                    47555222000
                </cbc:CompanyID>
                <cac:TaxScheme>
                    <cbc:ID>
                        GST
                    </cbc:ID>
                </cac:TaxScheme>
            </cac:PartyTaxScheme>
            <cac:PartyLegalEntity>
                <cbc:RegistrationName>
                    Supplier Official Name Ltd
                </cbc:RegistrationName>
                <cbc:CompanyID schemeID="0151">
                    47555222000
                </cbc:CompanyID>
                <cbc:CompanyLegalForm>
                    Partnership
                </cbc:CompanyLegalForm>
            </cac:PartyLegalEntity>
            <cac:Contact>
                <cbc:Name>
                    Ronald MacDonald
                </cbc:Name>
                <cbc:Telephone>
                    Mobile 0430123456
                </cbc:Telephone>
                <cbc:ElectronicMail>
                    ronald.macdonald@qualitygoods.com.au
                </cbc:ElectronicMail>
            </cac:Contact>
        </cac:Party>
    </cac:AccountingSupplierParty>
    <cac:AccountingCustomerParty>
        <cac:Party>
            <cbc:EndpointID schemeID="0088">
                9429033591476
            </cbc:EndpointID>
            <cac:PartyIdentification>
                <cbc:ID schemeID="0088">
                    9429033591476
                </cbc:ID>
            </cac:PartyIdentification>
            <cac:PartyName>
                <cbc:Name>
                    Trotters Trading Co Ltd
                </cbc:Name>
            </cac:PartyName>
            <cac:PostalAddress>
                <cbc:StreetName>
                    100 Queen Street
                </cbc:StreetName>
                <cbc:AdditionalStreetName>
                    Po box 878
                </cbc:AdditionalStreetName>
                <cbc:CityName>
                    Auckland
                </cbc:CityName>
                <cbc:PostalZone>
                    1234
                </cbc:PostalZone>
                <cac:Country>
                    <cbc:IdentificationCode>
                        NZ
                    </cbc:IdentificationCode>
                </cac:Country>
            </cac:PostalAddress>
            <cac:PartyTaxScheme>
                <cbc:CompanyID>
                    9429033591476
                </cbc:CompanyID>
                <cac:TaxScheme>
                    <cbc:ID>
                        GST
                    </cbc:ID>
                </cac:TaxScheme>
            </cac:PartyTaxScheme>
            <cac:PartyLegalEntity>
                <cbc:RegistrationName>
                    Buyer Official Name
                </cbc:RegistrationName>
                <cbc:CompanyID schemeID="0088">
                    9429033591476
                </cbc:CompanyID>
            </cac:PartyLegalEntity>
            <cac:Contact>
                <cbc:Name>
                    Lisa Johnson
                </cbc:Name>
                <cbc:Telephone>
                    261234567
                </cbc:Telephone>
                <cbc:ElectronicMail>
                    lj@buyer.co.nz
                </cbc:ElectronicMail>
            </cac:Contact>
        </cac:Party>
    </cac:AccountingCustomerParty>
    <cac:PayeeParty>
        <cac:PartyIdentification>
            <cbc:ID>
                91888222000
            </cbc:ID>
        </cac:PartyIdentification>
        <cac:PartyName>
            <cbc:Name>
                Mr Anderson
            </cbc:Name>
        </cac:PartyName>
        <cac:PartyLegalEntity>
            <cbc:CompanyID schemeID="0088">
                9429033591476
            </cbc:CompanyID>
        </cac:PartyLegalEntity>
    </cac:PayeeParty>
    <cac:TaxRepresentativeParty>
        <cac:PartyName>
            <cbc:Name>
                Mr Wilson
            </cbc:Name>
        </cac:PartyName>
        <cac:PostalAddress>
            <cbc:StreetName>
                16 Stout Street
            </cbc:StreetName>
            <cbc:AdditionalStreetName>
                Po box 878
            </cbc:AdditionalStreetName>
            <cbc:CityName>
                Auckland
            </cbc:CityName>
            <cbc:PostalZone>
                1234
            </cbc:PostalZone>
            <cbc:CountrySubentity>
                Ponsonby
            </cbc:CountrySubentity>
            <cac:AddressLine>
                <cbc:Line>
                    Unit 1
                </cbc:Line>
            </cac:AddressLine>
            <cac:Country>
                <cbc:IdentificationCode>
                    NZ
                </cbc:IdentificationCode>
            </cac:Country>
        </cac:PostalAddress>
        <cac:PartyTaxScheme>
            <cbc:CompanyID>
                9429033591476
            </cbc:CompanyID>
            <cac:TaxScheme>
                <cbc:ID>
                    GST
                </cbc:ID>
            </cac:TaxScheme>
        </cac:PartyTaxScheme>
    </cac:TaxRepresentativeParty>
    <cac:Delivery>
        <cbc:ActualDeliveryDate>
            2019-06-01
        </cbc:ActualDeliveryDate>
        <cac:DeliveryLocation>
            <cbc:ID schemeID="0088">
                9429033591476
            </cbc:ID>
            <cac:Address>
                <cbc:StreetName>
                    Delivery street 2
                </cbc:StreetName>
                <cbc:AdditionalStreetName>
                    Building 56
                </cbc:AdditionalStreetName>
                <cbc:CityName>
                    Auckland
                </cbc:CityName>
                <cbc:PostalZone>
                    1234
                </cbc:PostalZone>
                <cbc:CountrySubentity>
                    Ponsonby
                </cbc:CountrySubentity>
                <cac:AddressLine>
                    <cbc:Line>
                        Unit 1
                    </cbc:Line>
                </cac:AddressLine>
                <cac:Country>
                    <cbc:IdentificationCode>
                        NZ
                    </cbc:IdentificationCode>
                </cac:Country>
            </cac:Address>
        </cac:DeliveryLocation>
        <cac:DeliveryParty>
            <cac:PartyName>
                <cbc:Name>
                    Delivery party Name
                </cbc:Name>
            </cac:PartyName>
        </cac:DeliveryParty>
    </cac:Delivery>
    <cac:PaymentMeans>
        <cbc:PaymentMeansCode name="Credit transfer">
            30
        </cbc:PaymentMeansCode>
        <cbc:PaymentID>
            PaymentReferenceText
        </cbc:PaymentID>
        <cac:PayeeFinancialAccount>
            <cbc:ID>
                AccountNumber
            </cbc:ID>
            <cbc:Name>
                AccountName
            </cbc:Name>
            <cac:FinancialInstitutionBranch>
                <cbc:ID>
                    BSB Number
                </cbc:ID>
            </cac:FinancialInstitutionBranch>
        </cac:PayeeFinancialAccount>
    </cac:PaymentMeans>
    <cac:PaymentTerms>
        <cbc:Note>
            Payment within 30 days
        </cbc:Note>
    </cac:PaymentTerms>
    <cac:AllowanceCharge>
        <cbc:ChargeIndicator>
            true
        </cbc:ChargeIndicator>
        <cbc:AllowanceChargeReasonCode>
            SAA
        </cbc:AllowanceChargeReasonCode>
        <cbc:AllowanceChargeReason>
            Shipping and Handling
        </cbc:AllowanceChargeReason>
        <cbc:MultiplierFactorNumeric></cbc:MultiplierFactorNumeric>
        <cbc:Amount currencyID="AUD"></cbc:Amount>
        <cbc:BaseAmount currencyID="AUD"></cbc:BaseAmount>
        <cac:TaxCategory>
            <cbc:ID>
                S
            </cbc:ID>
            <cbc:Percent>
                10
            </cbc:Percent>
            <cac:TaxScheme>
                <cbc:ID>
                    GST
                </cbc:ID>
            </cac:TaxScheme>
        </cac:TaxCategory>
    </cac:AllowanceCharge>
    <cac:TaxTotal>
        <cbc:TaxAmount currencyID="AUD">
            148.74
        </cbc:TaxAmount>
        <cac:TaxSubtotal>
            <cbc:TaxableAmount currencyID="AUD">
                1487.4
            </cbc:TaxableAmount>
            <cbc:TaxAmount currencyID="AUD">
                148.74
            </cbc:TaxAmount>
            <cac:TaxCategory>
                <cbc:ID>
                    S
                </cbc:ID>
                <cbc:Percent>
                    10
                </cbc:Percent>
                <cac:TaxScheme>
                    <cbc:ID>
                        GST
                    </cbc:ID>
                </cac:TaxScheme>
            </cac:TaxCategory>
        </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:LegalMonetaryTotal>
        <cbc:LineExtensionAmount currencyID="AUD">
            1487.4
        </cbc:LineExtensionAmount>
        <cbc:TaxExclusiveAmount currencyID="AUD">
            1487.4
        </cbc:TaxExclusiveAmount>
        <cbc:TaxInclusiveAmount currencyID="AUD">
            1636.14
        </cbc:TaxInclusiveAmount>
        <cbc:ChargeTotalAmount currencyID="AUD"></cbc:ChargeTotalAmount>
        <cbc:PrepaidAmount currencyID="AUD"></cbc:PrepaidAmount>
        <cbc:PayableAmount currencyID="AUD">
            1636.14
        </cbc:PayableAmount>
    </cac:LegalMonetaryTotal>
    <cac:InvoiceLine>
        <cbc:ID>
            1
        </cbc:ID>
        <cbc:Note>
            Texts Giving More Info about the Invoice Line
        </cbc:Note>
        <cbc:InvoicedQuantity unitCode="E99">
            10
        </cbc:InvoicedQuantity>
        <cbc:LineExtensionAmount currencyID="AUD">
            299.9
        </cbc:LineExtensionAmount>
        <cbc:AccountingCost>
            Consulting Fees
        </cbc:AccountingCost>
        <cac:InvoicePeriod>
            <cbc:StartDate>
                2019-06-01
            </cbc:StartDate>
            <cbc:EndDate>
                2019-07-30
            </cbc:EndDate>
        </cac:InvoicePeriod>
        <cac:OrderLineReference>
            <cbc:LineID>
                123
            </cbc:LineID>
        </cac:OrderLineReference>
        <cac:DocumentReference>
            <cbc:ID schemeID="HWB">
                9000074677
            </cbc:ID>
            <cbc:DocumentTypeCode>
                130
            </cbc:DocumentTypeCode>
        </cac:DocumentReference>
        <cac:Item title="abc">
            <cbc:Description title="abc">
                Widgets True and Fair
            </cbc:Description>
            <cbc:Name>
                True-Widgets
            </cbc:Name>
            <cac:BuyersItemIdentification>
                <cbc:ID>
                    W659590
                </cbc:ID>
            </cac:BuyersItemIdentification>
            <cac:SellersItemIdentification>
                <cbc:ID>
                    WG546767
                </cbc:ID>
            </cac:SellersItemIdentification>
            <cac:StandardItemIdentification>
                <cbc:ID schemeID="0002">
                    WG546767
                </cbc:ID>
            </cac:StandardItemIdentification>
            <cac:OriginCountry>
                <cbc:IdentificationCode>
                    AU
                </cbc:IdentificationCode>
            </cac:OriginCountry>
            <cac:CommodityClassification>
                <cbc:ItemClassificationCode listID="SRV">
                    9348023
                </cbc:ItemClassificationCode>
            </cac:CommodityClassification>
            <cac:ClassifiedTaxCategory>
                <cbc:ID>
                    S
                </cbc:ID>
                <cbc:Percent>
                    10
                </cbc:Percent>
                <cac:TaxScheme>
                    <cbc:ID>
                        GST
                    </cbc:ID>
                </cac:TaxScheme>
            </cac:ClassifiedTaxCategory>
        </cac:Item>
        <cac:Price>
            <cbc:PriceAmount>
                29.99
            </cbc:PriceAmount>
            <cac:AllowanceCharge>
                <cbc:ChargeIndicator></cbc:ChargeIndicator>
                <cbc:Amount title="123" currencyID="AUD">
                    12
                </cbc:Amount>
                <cbc:BaseAmount currencyID="AUD">
                    29.99
                </cbc:BaseAmount>
            </cac:AllowanceCharge>
        </cac:Price>
    </cac:InvoiceLine>
    </Invoice>`
    
    const jsonO = xml2json(test)
    expect(JSON.parse(jsonO)).toMatchSnapshot();
    // console.log(beautify(JSON.parse(jsonO), null, 2, 100))
    const xmlO = json2xml(jsonO)
    // console.log(xmlO)

});