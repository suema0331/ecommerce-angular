import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { ShopFormService } from 'src/app/services/shop-form.service';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { Purchase } from 'src/app/common/purchase';
import { OrderItem } from 'src/app/common/order-item';
import { Order } from 'src/app/common/order';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { Router } from '@angular/router';
import { ShopValidators } from 'src/app/validators/shop-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup: FormGroup;
  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private shopFormService: ShopFormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.reviewCartDetails();

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace,
        ]),

        lastName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace,
        ]),
        email: new FormControl('', [
          Validators.required,
          // Angular: Validator.email is <someText>@<moreText>
          //
          // [a-z0-9.-]+\\.  -> match any combination of letters and digits, with period
          // [a-z]{2,4}$ -> domain extension 2-4 letters
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ]),
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace,
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace,
        ]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace,
        ]),
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace,
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace,
        ]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace,
        ]),
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace,
        ]),
        cardNumber: new FormControl('', [
          Validators.required,
          // 16 digits
          Validators.pattern('[0-9]{16}'),
        ]),
        securityCode: new FormControl('', [
          Validators.required,
          // 3 digits
          Validators.pattern('[0-9]{3}'),
        ]),
        expirationMonth: [''],
        expirationYear: [''],
      }),
    });

    // populate credit card months

    const startMonth: number = new Date().getMonth() + 1;
    console.log('startMonth: ' + startMonth);

    this.shopFormService.getCreditCardMonths(startMonth).subscribe((data) => {
      console.log('Retrieved credit card months: ' + JSON.stringify(data));
      this.creditCardMonths = data;
    });

    // populate credit card years

    this.shopFormService.getCreditCardYears().subscribe((data) => {
      console.log('Retrieved credit card years: ' + JSON.stringify(data));
      this.creditCardYears = data;
    });

    // populate countries

    this.shopFormService.getCountries().subscribe((data) => {
      console.log('Retrieved countries: ' + JSON.stringify(data));
      this.countries = data;
    });
  }

  onSubmit(): void {
    console.log('Handling the submit button');

    if (this.checkoutFormGroup.invalid) {
      // touching all fields triggers the display of the error messages
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    // set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // get cart items
    const cartItems = this.cartService.cartItems;

    const orderItems: OrderItem[] = cartItems.map(
      (tempCartItem) => new OrderItem(tempCartItem)
    );

    // set up purchase
    let purchase = new Purchase();

    // populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    // populate purchase - shipping address

    // TODO check
    // console.log(this.checkoutFormGroup.controls['shippingAddress'].value);// state, contry are included in objects

    purchase.shippingAddress =
      this.checkoutFormGroup.controls['shippingAddress'].value;

    // console.log(JSON.parse(JSON.stringify(purchase.shippingAddress.state)));
    // to convert JSON Object since we need string state and country name (not object)
    const shippingState: State = JSON.parse(
      JSON.stringify(purchase.shippingAddress.state)
    );

    const shippingCountry: State = JSON.parse(
      JSON.stringify(purchase.shippingAddress.country)
    );

    // console.log(shippingState); // object
    // console.log(shippingCountry); // object

    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    // populate purchase - billing address
    purchase.billingAddress =
      this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(
      JSON.stringify(purchase.billingAddress.state)
    );
    const billingCountry: Country = JSON.parse(
      JSON.stringify(purchase.billingAddress.country)
    );
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    // populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // call REST API via the CheckoutService
    this.checkoutService.placeOrder(purchase).subscribe({
      next: (response) => {
        alert(
          `Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`
        );

        // reset cart
        this.resetCart();
      },
      error: (err) => {
        alert(`There was an error: ${err.message}`);
      },
    });
  }

  resetCart(): void {
    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    // reset the form
    this.checkoutFormGroup.reset();

    // navigate back to the products page
    this.router.navigateByUrl('/products');
  }

  get firstName(): FormGroup {
    return this.checkoutFormGroup.get('customer.firstName') as FormGroup;
  }
  get lastName(): FormGroup {
    return this.checkoutFormGroup.get('customer.lastName') as FormGroup;
  }
  get email(): FormGroup {
    return this.checkoutFormGroup.get('customer.email') as FormGroup;
  }

  get shippingAddressStreet(): FormGroup {
    return this.checkoutFormGroup.get('shippingAddress.street') as FormGroup;
  }
  get shippingAddressCity(): FormGroup {
    return this.checkoutFormGroup.get('shippingAddress.city') as FormGroup;
  }
  get shippingAddressState(): FormGroup {
    return this.checkoutFormGroup.get('shippingAddress.state') as FormGroup;
  }
  get shippingAddressZipCode(): FormGroup {
    return this.checkoutFormGroup.get('shippingAddress.zipCode') as FormGroup;
  }
  get shippingAddressCountry(): FormGroup {
    return this.checkoutFormGroup.get('shippingAddress.country') as FormGroup;
  }

  get billingAddressStreet(): FormGroup {
    return this.checkoutFormGroup.get('billingAddress.street') as FormGroup;
  }
  get billingAddressCity(): FormGroup {
    return this.checkoutFormGroup.get('billingAddress.city') as FormGroup;
  }
  get billingAddressState(): FormGroup {
    return this.checkoutFormGroup.get('billingAddress.state') as FormGroup;
  }
  get billingAddressZipCode(): FormGroup {
    return this.checkoutFormGroup.get('billingAddress.zipCode') as FormGroup;
  }
  get billingAddressCountry(): FormGroup {
    return this.checkoutFormGroup.get('billingAddress.country') as FormGroup;
  }

  get creditCardType(): FormGroup {
    return this.checkoutFormGroup.get('creditCard.cardType') as FormGroup;
  }
  get creditCardNameOnCard(): FormGroup {
    return this.checkoutFormGroup.get('creditCard.nameOnCard') as FormGroup;
  }
  get creditCardNumber(): FormGroup {
    return this.checkoutFormGroup.get('creditCard.cardNumber') as FormGroup;
  }
  get creditCardSecurityCode(): FormGroup {
    return this.checkoutFormGroup.get('creditCard.securityCode') as FormGroup;
  }

  copyShippingAddressToBillingAddress(event: any): void {
    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(
        this.checkoutFormGroup.controls['shippingAddress'].value
      );

      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();

      this.billingAddressStates = [];
    }
  }

  handleMonthsAndYears(): void {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    if (!creditCardFormGroup) {
      return;
    }
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(
      creditCardFormGroup.value.expirationYear
    );

    // if the current year equals the selected year, then start with the current month

    let startMonth: number;

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }

    this.shopFormService.getCreditCardMonths(startMonth).subscribe((data) => {
      console.log('Retrieved credit card months: ' + JSON.stringify(data));
      this.creditCardMonths = data;
    });
  }

  getStates(formGroupName: string): void {
    const formGroup = this.checkoutFormGroup.get(formGroupName);

    if (!formGroup) {
      return;
    }
    const countryCode = formGroup.value.country.code;
    const countryName = formGroup.value.country.name;

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);

    this.shopFormService.getStates(countryCode).subscribe((data) => {
      if (formGroupName === 'shippingAddress') {
        this.shippingAddressStates = data;
      } else {
        this.billingAddressStates = data;
      }

      // select first item by default
      formGroup?.get('state')?.setValue(data[0]);
    });
  }

  reviewCartDetails(): void {
    // subscribe price and quantity
    // note: CheckoutComponent is instantiated later in the app, so we need to get a replay of the message missed
    this.cartService.totalPrice.subscribe((totalPrice) => {
      this.totalPrice = totalPrice;
    });

    this.cartService.totalQuantity.subscribe((totalQuantity) => {
      this.totalQuantity = totalQuantity;
    });
  }
}
