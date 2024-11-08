@isTest
public class OrderLIneTest {
    static testMethod void testOrderLineItemUtilities()
    {
        Triggerhandler.bypass('AccountTriggerHandler');
        Triggerhandler.bypass('SalesOrganizationTriggerHandler');
        Triggerhandler.bypass('QuoteTriggerHandler');
        Triggerhandler.bypass('QuoteLineItemTriggerHandler');
        Triggerhandler.bypass('OrderTriggerHandler');
        
        Product2 prd = new Product2();
        prd.Name = '11-11-11-11';
        prd.ProductCode='T1-000991';
        prd.IsActive = true;
        Insert prd;
        
        /* Create Standard Pricebook Entry*/
        PricebookEntry pbeStd = new PricebookEntry();
        pbeStd.Pricebook2Id = Test.getStandardPricebookId();
        pbeStd.Product2Id = prd.Id;
        pbeStd.UnitPrice = 100;
        pbeStd.IsActive = true;
        Insert pbeStd;
        
        Account acc = new Account();
        acc.Name = 'Test Account';
        acc.Approval_Status__c = 'Approved';
        insert acc;
        
        Opportunity opp = new Opportunity();
        opp.Name = 'Test Opportunity';
        opp.AccountId = acc.Id;
        opp.CloseDate = system.today();
        opp.StageName = 'Qualification';
        opp.Pricebook2Id = Test.getStandardPricebookId(); 
        insert opp;        
        
        opp.Fast_Quote__c = true;
        update opp;
        
        Quote qt = [SELECT Id, OpportunityId FROM Quote WHERE OpportunityId =: opp.Id];
        
        QuoteLineItem qli = new QuoteLineItem();
        qli.Product2Id = prd.Id;
        qli.PricebookEntryId = pbeStd.Id;
        qli.Quantity = 1;
        qli.UnitPrice = 1;
        qli.QuoteId = qt.Id;
        insert qli;

        qt.Status = 'Accepted';
        update qt; 
        
        opp.SyncedQuoteId = qt.Id;
        opp.StageName = 'Closed Won';
        update opp;        
        
        Order ord = new Order();
        ord.Name = 'Test Order';
        ord.AccountId = acc.Id;
        ord.Pricebook2Id = opp.Pricebook2Id;
        ord.OpportunityId = opp.Id;
        ord.EffectiveDate = system.today();
        ord.Status = 'Draft';
        insert ord;
        
        OrderItem oli = new OrderItem();
        oli.Product2Id = prd.Id;
        oli.PricebookEntryId = pbeStd.Id;
        oli.Quantity = 1;
        oli.UnitPrice = 1;
        oli.OrderId = ord.Id;
        insert oli;
        
        oli.UnitPrice = 200;
        update oli;
        
    }   

}