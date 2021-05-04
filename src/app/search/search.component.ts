import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators'
import { User } from '../models/user.model';
import { environment } from 'src/environments/environment';
import { mockSearchResult } from '../mock/search-result.mock'

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, OnDestroy {

  searchText: string;
  searchPage: number;
  lastSearchedText: string;

  subSearch: Subscription;
  searchResult: any;

  totalCount: number;

  displayTotalCount: boolean = false;

  subjectInput = new Subject<any>();
  subInput: Subscription;

  firstIndex: number = 0;
  lastIndex: number = 0;

  showValidationMessage: boolean = false;
  validationMessage: string = null;
  showChildValidationMessage: boolean = false;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.subInput = this.subjectInput.pipe(debounceTime(250), filter(x => this.searchText != null && this.searchText != '')).subscribe(() => {
      this.searchPage = 1;
      this.searchUsers(this.searchText)
    });
  }

  ngOnDestroy() {
    if (this.subSearch && !this.subSearch.closed) this.subSearch.unsubscribe();
    if (this.subInput && !this.subInput.closed) this.subInput.unsubscribe();
  }

  // The Input event is the simplest way I can think of to search live while the user types (instead of using a Search button or something).
  onInputChanged() {
    this.showValidationMessage = false;
    this.validationMessage = null;

    if (this.searchText) {
      this.subjectInput.next();
    }
    else {
      this.displayTotalCount = false;
    }
  }

  private searchUsers(text: string) {
    if (text != this.lastSearchedText) {
      this.lastSearchedText = text;
      this.http.get(environment.searchUrl, {params: {q: '"' + text + '" in:name type:user in:email', per_page: environment.resultsPerPage.toString(), page: this.searchPage.toString()}}).subscribe((results: any) => {
        this.showValidationMessage = false;
        this.showChildValidationMessage = false;
        this.validationMessage = null;
        this.displayTotalCount = true;
        this.lastSearchedText = this.searchText;
        this.totalCount = results.total_count;
        this.searchResult = results;
        this.firstIndex = environment.resultsPerPage * (this.searchPage-1) + 1;
        this.lastIndex = this.min(this.totalCount, (environment.resultsPerPage * this.searchPage));
      }, (error) => {
        this.validationMessage = error.error.message;
        this.showValidationMessage = true;        
      });
    }
  }

  private min(a: number, b: number) : number {
    return (a < b ? a : b);
  }

  onNextPageClick() {
    if (this.showValidationMessage) return;
    this.searchPage++;
    this.lastSearchedText = '';
    this.searchUsers(this.searchText);
  }

  onPreviousPageClick() {
    if (this.showValidationMessage) return;
    this.searchPage--;
    this.lastSearchedText = '';
    this.searchUsers(this.searchText);
  }

  onChildError() {
    this.showChildValidationMessage = true;
  }
}
