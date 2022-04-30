import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/common/product';
import { ActivatedRoute } from '@angular/router';
import { GetResponseProducts } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  currentCategoryId: number = 0;
  previousCategoryId: number = 0;
  currentCategoryName: string = '';
  searchMode: boolean = false;

  // pagination
  thePageNumber: number = 1;
  thePageSize: number = 8;
  theTotalElements: number = 0;

  previousKeyword: string = '';

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.getProducts();
    });
  }

  getProducts(): void {
    // passed from SearchComponent
    this.searchMode = this.route.snapshot.paramMap.has('keyword');

    if (this.searchMode) {
      this.handleSearchProducts();
    } else {
      this.handleListProducts();
    }
  }

  handleSearchProducts(): void {
    const keyword = this.route.snapshot.paramMap.get('keyword')!;

    // if we have a different keyword than previous
    // then set thePageNumber to 1

    if (this.previousKeyword != keyword) {
      this.thePageNumber = 1;
    }

    this.previousKeyword = keyword;

    console.log(`keyword=${keyword}, thePageNumber=${this.thePageNumber}`);

    // now search for the products using keyword
    this.productService
      .searchProductsPaginate(this.thePageNumber - 1, this.thePageSize, keyword)
      .subscribe((data) => {
        this.products = data._embedded.products;
        this.thePageNumber = data.page.number + 1;
        this.thePageSize = data.page.size;
        this.theTotalElements = data.page.totalElements;
        this.currentCategoryName = `${keyword} に関連する商品が ${data.page.totalElements} 件見つかりました`;
        // next(data) {
        //   // this.processResult();
        //   this.products = data._embedded.products;
        //   this.thePageNumber = data.page.number + 1;
        //   this.thePageSize = data.page.size;
        //   this.theTotalElements = data.page.totalElements;
        // },

        // complete() {
        // () =>
        // },
      });

    // this.productService.searchProducts(keyword).subscribe((data) => {
    //   this.products = data;
    //   this.currentCategoryName = `${keyword} に関連する商品が ${data.length} 件見つかりました`;
    // });
  }

  handleListProducts(): void {
    // check if "id" parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      // get the "id" param string. convert string to a number using the "+" symbol
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
      this.currentCategoryName = this.route.snapshot.paramMap.get('name') ?? '';
    } else {
      // not category id available ... default to All
      this.currentCategoryId = 0;
      this.currentCategoryName = 'All Products';
    }

    //
    // Check if we have a different category than previous
    // Note: Angular will reuse a component if it is currently being viewed
    //

    // if we have a different category id than previous
    // then set thePageNumber back to 1
    if (this.previousCategoryId != this.currentCategoryId) {
      this.thePageNumber = 1;
    }

    this.previousCategoryId = this.currentCategoryId;

    console.log(
      `currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`
    );

    // now get the products for the given category id
    this.productService
      .getProductListPaginate(
        this.thePageNumber - 1,
        this.thePageSize,
        this.currentCategoryId
      )
      .subscribe(this.processResult());
  }

  processResult() {
    return (data: GetResponseProducts) => {
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    };
  }

  updatePageSize(event: any): void {
    console.log(event);
    const pageSize = +(<HTMLInputElement>event.target).value;
    this.thePageSize = pageSize;
    this.thePageNumber = 1;
    this.getProducts();
  }
}
