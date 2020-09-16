import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbAuthToken } from '@nebular/auth';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';
import { Subject } from 'rxjs';
import { map, takeUntil, filter } from 'rxjs/operators';
import { AuthService } from '../../../@auth/core/auth.service';
import { LayoutService } from '../../../@core/utils';
import { HubUser, HeaderBio } from '../../../@models/user.model';

import { RippleService } from '../../../@core/utils/ripple.service';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  private static readonly PROFILE = 'Profile';
  private static readonly LOGOUT = 'Log Out';

  private destroy$: Subject<void> = new Subject<void>();

  userPictureOnly: boolean = false;
  user: HeaderBio;

  isPrivilegedUser = false;

  themes = [
    {
      value: 'material-light',
      name: 'Material Light',
      icon: 'bulb-outline',
    },
    {
      value: 'dark',
      name: 'Dark',
      icon: 'moon-outline',
    },
  ];

  currentTheme = 'material-light'; // can be switched back to material-light

  userMenu = this.getMenuItems();

  constructor(
    private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private layoutService: LayoutService,
    private authService: AuthService,
    private breakpointService: NbMediaBreakpointsService,
    private rippleService: RippleService,
    private router: Router
  ) {

    this.authService.onTokenChange()
      .subscribe((token: NbAuthToken) => {
        if (token.isValid()) {
          this.user = token.getPayload();
        }
      });
  }

  getMenuItems() {
    const userLink = this.user ? '/pages/users/current/' : '';
    return [
      { title: HeaderComponent.PROFILE, link: userLink, queryParams: { profile: true } },
      { title: HeaderComponent.LOGOUT },
    ];
  }

  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme;

    this.authService.userObs
      .pipe(
        takeUntil(this.destroy$),
      )
      .subscribe((user: HubUser) => {
        this.user = user;
        this.userMenu = this.getMenuItems();
      });

    this.menuService.onItemClick()
      .pipe(
        takeUntil(this.destroy$),
        filter(({ tag }) => tag === 'context-menu'),
        map(({ item: { title } }) => title),
      ).subscribe((title: string) => {
        title === HeaderComponent.LOGOUT ?
          this.logout() :
          this.navigateToMenuPage(
            title.toLowerCase().replace(/ /g, '_')
          ); // pages are named profile and settings TODO create those pages
      });

    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => {
        this.currentTheme = themeName;
        this.rippleService.toggle(themeName?.startsWith('material'));
      });
  }

  navigateToMenuPage(page: string) {
    this.router.navigateByUrl(page);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout() {
    this.authService.logout('email');
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  changeRoles(roleNames: string) {
    this.authService.setAllRoles(roleNames.split(','));
  }

  get roles() {
    return this.authService.getAllRoles();
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }
}
