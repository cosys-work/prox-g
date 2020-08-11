"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppComponent = void 0;
/**
 * @license
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
const core_1 = require("@angular/core");
const analytics_service_1 = require("./@core/utils/analytics.service");
const seo_service_1 = require("./@core/utils/seo.service");
const auth_service_1 = require("./services/auth/auth.service");
let AppComponent = class AppComponent {
    constructor(analytics, seoService, authService) {
        this.analytics = analytics;
        this.seoService = seoService;
        this.authService = authService;
    }
    ngOnInit() {
        this.analytics.trackPageViews();
        this.seoService.trackCanonicalChanges();
        this.authService.publicLogin(); // login as a public user, read only & only for public buckets
    }
};
AppComponent = __decorate([
    core_1.Component({
        selector: 'ngx-app',
        template: '<router-outlet></router-outlet>',
    }),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService,
        seo_service_1.SeoService,
        auth_service_1.AuthService])
], AppComponent);
exports.AppComponent = AppComponent;