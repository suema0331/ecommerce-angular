import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../common/product';
import { ProductCategory } from '../common/product-category';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private baseUrl = 'http://localhost:8080/api/products'; // by default, Spring Data REST only returns the first page of 20 items
  // private baseUrl = 'http://localhost:8080/api/products?size=100'; // change to 100 items

  private categoryUrl = 'http://localhost:8080/api/product-category';

  constructor(private httpClient: HttpClient) {}

  getProductListPaginate(
    thePage: number,
    thePageSize: number,
    categoryId: number
  ): Observable<GetResponseProducts> {
    let searchUrl = '';
    if (!categoryId || categoryId === 0) {
      searchUrl = this.baseUrl + `?page=${thePage}&size=${thePageSize}`;
      // searchUrl = this.baseUrl;
    } else {
      searchUrl =
        `${this.baseUrl}/search/findByCategoryId?id=${categoryId}` +
        `&page=${thePage}&size=${thePageSize}`;
    }
    // map the json data from Spring Data Rest to Product[]
    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

  getProductList(categoryId: number): Observable<Product[]> {
    let searchUrl = '';
    if (!categoryId || categoryId === 0) {
      searchUrl = this.baseUrl;
    } else {
      searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${categoryId}`;
    }
    // map the json data from Spring Data Rest to Product[]
    return this.getProducts(searchUrl);
  }

  searchProducts(keyword: string): Observable<Product[]> {
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${keyword}`;
    return this.getProducts(searchUrl);
  }

  searchProductsPaginate(
    thePage: number,
    thePageSize: number,
    theKeyword: string
  ): Observable<GetResponseProducts> {
    // need to build URL based on keyword, page and size
    const searchUrl =
      `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}` +
      `&page=${thePage}&size=${thePageSize}`;

    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

  getProduct(productId: number): Observable<Product> {
    const searchUrl = `${this.baseUrl}/${productId}`;
    return this.httpClient.get<Product>(searchUrl);
  }

  private getProducts(searchUrl: string): Observable<Product[]> {
    return this.httpClient
      .get<GetResponseProducts>(searchUrl)
      .pipe(map((response) => response._embedded.products));
  }

  getProductCategories(): Observable<ProductCategory[]> {
    return this.httpClient
      .get<GetResponseProductCategories>(this.categoryUrl)
      .pipe(map((response) => response._embedded.productCategory));
  }
}

export interface GetResponseProducts {
  _embedded: {
    products: Product[];
  };
  page: {
    size: number;
    totalElements: number; // counts
    totalPages: number;
    number: number;
  };
}

interface GetResponseProductCategories {
  _embedded: {
    productCategory: ProductCategory[];
  };
}
