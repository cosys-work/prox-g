import { Component, OnDestroy, OnInit, Inject, ViewChild, ContentChild } from '@angular/core';
import { Router } from '@angular/router';
import { NbAuthToken } from '@nebular/auth';
import {
  NbContextMenuDirective,
  NbDialogService,
  NbMediaBreakpointsService,
  NbMenuService,
  NbPopoverDirective,
  NbSidebarService,
  NbThemeService,
  NB_WINDOW
} from '@nebular/theme';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../@auth/core/auth.service';
import { LayoutService } from '../../../@core/utils';
import { RippleService } from '../../../@core/utils/ripple.service';
import { HeaderBio, HubUser } from '../../../@models/user.model';
import { MenuItemsComponent } from './menu-items/menu-items.component';


@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  private static readonly PROFILE = 'Profile';
  private static readonly LOGOUT = 'Log Out';

  private destroy$: Subject<void> = new Subject<void>();
  public readonly materialTheme$: Observable<boolean>;
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



  @ViewChild(NbContextMenuDirective) contextMenu: NbContextMenuDirective;

  @ContentChild('menu') menu: MenuItemsComponent;

  isContextMenuShown = false;

  constructor(
    private sidebarService: NbSidebarService,
    private themeService: NbThemeService,
    private layoutService: LayoutService,
    private authService: AuthService,
    private breakpointService: NbMediaBreakpointsService,
    private dialogService: NbDialogService,
    private rippleService: RippleService,
    private router: Router,
    @Inject(NB_WINDOW) private window: any
  ) {

    this.materialTheme$ = this.themeService.onThemeChange()
    .pipe(map(theme => {
      const themeName: string = theme?.name || '';
      return themeName.startsWith('material');
    }));

  }

  protected openDialog(hasBackdrop: boolean) {
    this.dialogService.open(MenuItemsComponent, { hasBackdrop });
  }

  get items() {
    return this.getMenuItems();
  }

  openClose(_: any) {
    this.isContextMenuShown = !this.isContextMenuShown;
    this.isContextMenuShown ? this.contextMenu.show() : this.contextMenu.hide();
  }

  getMenuItems() {
    const userLink = this.user ? '/pages/users/current/' : '';
    return [
      { title: HeaderComponent.PROFILE, link: userLink, queryParams: { profile: true } },
      { title: HeaderComponent.LOGOUT },
    ];
  }


  ngOnInit() {
    this.currentTheme = 'material-light';

    this.authService.userObs
      .pipe(
        takeUntil(this.destroy$),
      )
      .subscribe((user: HubUser) => {
        this.user = user;
        this.userMenu = this.getMenuItems();
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
    this.sidebarService.compact('menu-sidebar');
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
    return false;
  }
}
