import { environment } from '../../../environments/environment'
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { take } from 'rxjs/operators'
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit, OnDestroy {

  private _searchResultUser;
  @Input('user') set searchResultUser(value) {
    this._searchResultUser = value;
    this.getUserFromSearchResultUser();
    //this.setMockUser();
  };
  get searchResultUser() {
    return this._searchResultUser;
  }

  @Output('error') errorEvent: EventEmitter<void> = new EventEmitter<void>();

  avatarUrl: string;
  username: string;
  location: string;
  realName: string;
  email: string;
  publicRepos: number;
  accountCreated: Date;
  lastUpdated: Date;
  profileUrl: string;
  reposUrl: string;

  constructor(private http: HttpClient) { }

  ngOnInit() {

  }

  ngOnDestroy() {
    
  }

  private getUserFromSearchResultUser() {
    this.http.get(environment.getUserUrl + '/' + this.searchResultUser.login).pipe(take(1)).subscribe((result: User) => {
      this.avatarUrl = result.avatar_url;
      this.username = result.login;
      this.accountCreated = result.created_at;
      this.lastUpdated = result.updated_at;
      this.email = result.email;
      this.location = result.location;
      this.publicRepos = result.public_repos;
      this.realName = result.name;
      this.profileUrl = result.html_url;
      this.reposUrl = result.html_url + '?tab=repositories';
    }, (error) => {
      this.errorEvent.emit();
    });
  }
}
