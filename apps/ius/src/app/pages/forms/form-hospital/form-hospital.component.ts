import { Component, OnInit } from '@angular/core';
import { COUNTRIES, NEARBY_COUNTRIES } from '../../../@core/data/countries.geo';
import { PROVINCES } from '../../../@core/data/province-districts.geo';
import { Formeta } from '../../../@comp/cov-form/formeta.class';

class TestRecord {
  date: Date;
  result: boolean;
  lab: string;
}

class SymptomRecord {
  date: Date;
  commonSymptoms: string[];
  otherSymptoms: string;
}

@Component({
  selector: 'cov-form-hospital',
  styleUrls: ['./form-hospital.component.scss'],
  templateUrl: './form-hospital.component.html',
})
export class FormHospitalComponent extends Formeta implements OnInit {

  countries: string[];
  nearbyCountries: string[];

  provinces: string[];
  destinationOpts: string[] | undefined;
  addressOpts: string[] | undefined;
  districts = { destinationOpts: null, addressOpts: null };

  permanentAddrProvince: string = '';
  finalDestProvince: string = '';

  addTransitCountries = false;

  pcrRecords: Array<TestRecord> = [];
  rdtRecords: Array<TestRecord> = [];
  symptomRecords: Array<SymptomRecord> = [];

  relationName = 'Father';
  status = 'Recovery';

  ngOnInit() {
    this.countries = COUNTRIES;
    this.nearbyCountries = NEARBY_COUNTRIES;
    this.provinces = PROVINCES.map(province => province.name);
  }

  changeAddrProvince(event: string) {
    this.permanentAddrProvince = event;
    this.districts.addressOpts = PROVINCES?.find(province => province.name === this.permanentAddrProvince)?.districts;
  }

  changeDestProvince(event: string) {
    this.finalDestProvince = event;
    this.districts.destinationOpts = PROVINCES?.find(province => province.name === this.finalDestProvince)?.districts;
  }

  changeRelationship(event: string) {
    this.relationName = event;
  }

  statusChange(event: string) {
    this.status = event;
  }

  addSymptomRecord(_: boolean) {
    this.symptomRecords = [ ...this.symptomRecords, new SymptomRecord()];
  }

  addPCRRecord(_: boolean) {
    this.pcrRecords = [ ...this.pcrRecords, new TestRecord()];
  }

  addRDTRecord(_: boolean) {
    this.rdtRecords = [ ...this.rdtRecords, new TestRecord()];
  }

  formInit(): void {
    throw new Error('Method not implemented.');
  }

  onFormChanges(): void {
    throw new Error('Method not implemented.');
  }

  saveChanges(): void {
    throw new Error('Method not implemented.');
  }

  loadChanges(): void {
    throw new Error('Method not implemented.');
  }

}