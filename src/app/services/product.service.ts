import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../common/product';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private baseUrl = 'http://localhost:8080/api/products'; // by default, Spring Data REST only returns the first page of 20 items
  // private baseUrl = 'http://localhost:8080/api/products?size=100'; // change to 100 items

  constructor(private httpClient: HttpClient) {}

  getProductList(): Observable<Product[]> {
    // map the json data from Spring Data Rest to Product[]
    return this.httpClient
      .get<GetResponse>(this.baseUrl)
      .pipe(map((response) => response._embedded.products));
  }
}

interface GetResponse {
  _embedded: {
    products: Product[];
  };
}
