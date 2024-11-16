import { LightningElement, track, wire, api } from 'lwc';
import getPaymentRecordTypes from '@salesforce/apex/addres_Payment.getPaymentRecordTypes';
import savePayment from '@salesforce/apex/addres_Payment.savePayment';
import validateFields from '@salesforce/apex/addres_Payment.validateFields';
import getAddress from '@salesforce/apex/addres_Payment.getAddress';
// import getOrder from '@salesforce/apex/addres_Payment.getOrder';
import Id from "@salesforce/user/Id";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Payment extends LightningElement {
    isCredetCart = true;
    isCheck = false;
    isCash = false;
    userId = Id;
@track statement;
    
    @track payment = {
        Orderc__c: '',
        Amount__c: 0,
        Billing_Name__c: '',
        Billing_Street__c: '',
        Billing_City__c: '',
        Billing_State__c: '',
        Billing_Postal_Code__c: '',
        Credit_Card_Number__c: '',
        Credit_Card_Expiration_month__c: '',
        Expiration_Year__c: '',
        Credit_Card_Security_Code__c: '',
        Check_Account_Number__c: '',
        Check_Routing_Number__c: ''
    };
    @track recordTypeOptions = [];
    @track isGuest = false;
    @track selectedRecordTypeId;
    @track expirationYears = [];
    @track paymentSuccess = false;

    


    @wire(getPaymentRecordTypes)
    wiredRecordTypes({ error, data }) {
        if (data) {
            this.recordTypeOptions = data.map(recordType => {
                return { value: recordType.label, label: recordType.value };
            });
            console.log('recordTypeOptions:', JSON.stringify(this.recordTypeOptions));
        } else if (error) {
            console.error('Error fetching record types:', error);
        }
    }

    @track address = {};

    @wire(getAddress, {UserId: '$userId'})
        wiredAddrs({data, error}){
       if(data){
        this.address = data;
       this.payment.Billing_Name__c = data.First_Name__c + ' ' + data.Last_Name__c;
            this.payment.Billing_Street__c = data.Street__c;
            this.payment.Billing_City__c = data.City__c;
            this.payment.Billing_State__c = data.State__c;
            this.payment.Billing_Postal_Code__c = data.Postal_Code__c;
       
    
                
            
    }
        }

    @track creditCardExpirationMonth = '';
    @track expirationYear = '';
  
    @api
    get thisPayment() {
        return {
            Credit_Card_Expiration_Month__c: this.creditCardExpirationMonth,
            Expiration_Year__c: this.expirationYear
        };
    }
  
    set thisPayment(value) {
        this.creditCardExpirationMonth = value.Credit_Card_Expiration_Month__c;
        this.expirationYear = value.Expiration_Year__c;
    }
  
    get monthOptions() {
        return [
            { label: 'January', value: '01' },
            { label: 'February', value: '02' },
            { label: 'March', value: '03' },
            { label: 'April', value: '04' },
            { label: 'May', value: '05' },
            { label: 'June', value: '06' },
            { label: 'July', value: '07' },
            { label: 'August', value: '08' },
            { label: 'September', value: '09' },
            { label: 'October', value: '10' },
            { label: 'November', value: '11' },
            { label: 'December', value: '12' }
        ];
    }
  
    get yearOptions() {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = 0; i < 10; i++) {
            const year = currentYear + i;
            years.push({ label: year.toString(), value: year.toString() });
        }
        return years;
    }

    @api paymentType;

    handleChange(event) {
        this.selectedRecordTypeId = event.detail.value;
        if (this.selectedRecordTypeId === '012J7000000TSMbIAO') {
            this.isCredetCart = true;
            this.isCheck = false;
            this.isCash = false;
        } else if (this.selectedRecordTypeId === '012J7000000TSMgIAO') {
            this.isCredetCart = false;
            this.isCheck = true;
            this.isCash = false;
        } else if (this.selectedRecordTypeId === '012J7000000TSMlIAO') {
            this.isCredetCart = false;
            this.isCheck = false;
            this.isCash = true;
        }

        const combobox = this.template.querySelector('lightning-combobox');
        if (combobox) {
            const selectedLabel = combobox.options.find(option => option.value === combobox.value)?.label;
            this.paymentType = selectedLabel;
        } 
        console.log('selectedRecordTypeId:', JSON.stringify(this.selectedRecordTypeId));
        console.log('paymentType:', JSON.stringify(this.paymentType));
  
    }

    updateBillingAddress() {
        // Get the billing address element
        const billingAddressElement = this.template.querySelector('#billing-address');
        if (billingAddressElement && this.statement) {
            // Replace newline characters with <br> tags and set the HTML
            billingAddressElement.innerHTML = this.statement.Billing_Street__c.replace(/\n/g, '<br>');
        }
    }

    handleFieldChange(event) {
        const field = event.target.name;
        this.payment[field] = event.target.value;
    }

    handleSavePayment() {
        validateFields({ payment: this.payment, paymentType: this.paymentType })
        savePayment({ payment: this.payment, paymentType: this.paymentType })
            .then(result => {
                this.paymentSuccess = true;
                this.showToast('Success', result, 'success');
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title,
            message,
            variant,
        });
        this.dispatchEvent(evt);
    }

}