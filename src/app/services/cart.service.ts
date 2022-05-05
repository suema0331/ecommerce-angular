import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  // cartItems: CartItem[] = new Array<CartItem>();
  cartItems: CartItem[] = new Array<CartItem>();

  // totalPrice: Subject<number> = new Subject<number>();
  // BehaviorSubject emits its current value whenever it is subscribed to.
  // c.f. ReplaySubject "replays" old values to new subscribers by emitting them when they first subscribe
  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  // Once a web browser tab is closed, sessionStorage is no longer available.
  // (The data's only in the browser's memory.)
  // storage: Storage = sessionStorage;

  // session storage is persisted and survives browser restarts
  storage: Storage = localStorage;

  constructor() {
    // read data from storage
    if (!this.storage.getItem('cartItems')) {
      return;
    }
    this.cartItems = JSON.parse(this.storage.getItem('cartItems') as string);

    // compute totals based on the data that is read from storage
    this.computeCartTotals();
  }

  addToCart(theCartItem: CartItem) {
    // check if we already have the item in our cart
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem | undefined = {} as CartItem;
    // let existingCartItems = [];

    if (this.cartItems && this.cartItems.length > 0) {
      // find the item in the cart based on item id

      existingCartItem = this.cartItems.find(
        (tempCartItem) => tempCartItem.id === theCartItem.id
      );

      // check if we found it
      alreadyExistsInCart = existingCartItem !== undefined;
      // alreadyExistsInCart = existingCartItems.length > 0;
    }

    if (alreadyExistsInCart) {
      // increment the quantity
      existingCartItem!.quantity++;
    } else {
      // just add the item to the array
      this.cartItems.push(theCartItem);
    }

    // compute cart total price and total quantity
    this.computeCartTotals();
  }

  computeCartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (let currentCartItem of this.cartItems) {
      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice;
      totalQuantityValue += currentCartItem.quantity;
    }

    // publish the new values ... all subscribers will receive the new data
    // 1. cartService will publish events to all subscribers (totalPrice, totalQuantity)
    // 2. next() will actually publish or send the event.
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    // log cart data just for debugging purposes
    this.logCartData(totalPriceValue, totalQuantityValue);

    // persist cart data
    this.persistCartItems();
  }

  persistCartItems(): void {
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }

  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    console.log('Contents of the cart');
    for (let tempCartItem of this.cartItems) {
      const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice;
      console.log(
        `name: ${tempCartItem.name}, quantity=${tempCartItem.quantity}, unitPrice=${tempCartItem.unitPrice}, subTotalPrice=${subTotalPrice}`
      );
    }

    // only show two digits after decimal 124.98
    console.log(
      `totalPrice: ${totalPriceValue.toFixed(
        2
      )}, totalQuantity: ${totalQuantityValue}`
    );
    console.log('----');
  }

  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;
    if (theCartItem.quantity === 0) {
      this.remove(theCartItem);
    } else {
      this.computeCartTotals();
    }
  }

  remove(theCartItem: CartItem) {
    // get index of item in the array
    const itemIndex = this.cartItems.findIndex(
      (tempCartItem) => tempCartItem.id === theCartItem.id
    );

    // if found, remove the item from the array at the given index
    if (itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1);

      this.computeCartTotals();
    }
  }
}
