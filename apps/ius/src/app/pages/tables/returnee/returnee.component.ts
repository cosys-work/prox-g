import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { NgxCsvParser, NgxCSVParserError } from 'ngx-csv-parser';
import { settings } from '../../../@models/tabular/settings.values';

import { ReturneeService } from './returnee.service';
import {
  CSV_UPLOAD_INSTR,
  CSV_UPLOAD_INSTR_ERR,
  CSV_UPLOAD_CONFIRM,
} from '../../../@core/data/messages';

import { ReturneeTableService } from './returnee-table.service';


// TODO refactor repeated codes in Returnee, PCR and RDT table component
// use Tabular service or higher order component or abstract component class

@Component({
  selector: 'cov-returnee',
  templateUrl: './returnee.component.html',
  styleUrls: ['./returnee.component.scss'],
})
export class ReturneeComponent implements OnInit {
  columns: {};
  settingsAndColumns = settings;

  isFileLoaded = false;
  uploadInstruction = CSV_UPLOAD_INSTR;

  source: LocalDataSource = new LocalDataSource();

  rowsFromCsvFile: {}[] = [];
  rowsReplacedByCsvFile: {}[] = [];

  @ViewChild('fileImportInput') fileImportInput: ElementRef;

  constructor(
    private returneeTableService: ReturneeTableService,
    private returneeService: ReturneeService,
    private ngxCsvParser: NgxCsvParser,
  ) {}

  ngOnInit(): void {
    this.initializeHeadersAndSettings();

    // table contents init
    this.returneeTableService.getRows().subscribe((rows: any) => {
      this.source.load(rows);
    });

    this.returneeTableService.enableDBToTableSync(this.source);
  }

  private initializeHeadersAndSettings() {
    this.returneeTableService.getColumns().subscribe((cols: any) => {
      this.columns = cols;
      const colsWithoutIdRev = { ...cols };
      delete colsWithoutIdRev['_id'];
      delete colsWithoutIdRev['_rev'];
      if (cols['province']) {
        cols['province']['filter'] = this?.returneeTableService?.prepareProvinceDropdown();
        cols['province']['editor'] = cols['province']['filter'];
      }
      this.settingsAndColumns = {
        ...this.settingsAndColumns,
        columns: colsWithoutIdRev || {},
      };
    });
  }

// TODO in all 'Aggregates' tables, use dialog for errors e.g. no rowData matches constraints in above filter
// https://akveo.github.io/nebular/docs/components/dialog/overview#nbdialogservice
  csvUploadListener(event: any) {
    const files = event.srcElement.files;
    this.isFileLoaded = files ? true : false;
    this.ngxCsvParser
      .parse(files[0], { header: false, delimiter: ',' })
      .subscribe(
        (result: Array<any>) => {
          this.rowsFromCsvFile = result
            .slice(1)
            .filter((rowData) => {
              // -2 since db headers contain _id and _rev fields as well
              const headerLengthMatches =
                rowData.length === this.returneeService.headers.length - 2;
              if (!headerLengthMatches) {
                this.resetFileUploader();
                this.uploadInstruction = CSV_UPLOAD_INSTR_ERR;
              }
              const isNotEmptyRow =
                rowData
                  .map((column: string) => column.length)
                  .reduce(
                    (total: number, colLength: number) => total + colLength
                  ) !== 0;
              return headerLengthMatches && isNotEmptyRow;
            })
            .map((rowData: any) => {
              this.uploadInstruction = CSV_UPLOAD_CONFIRM;
              const rowObj: any | {} = {};
              this.returneeService.headers.forEach((header, index) => {
                rowObj[header[0]] =
                  index !== 0
                    ? this.returneeTableService.xTrim(rowData[index - 1])
                    : this.returneeTableService.prepareDocID(
                        rowData[0],
                        rowData[1],
                        [rowData[2], rowData[3]]
                      );
              });
              this.csvRowAndExistingRowMerger(rowObj);
              return rowObj;
            });
        },
        (_: NgxCSVParserError | Error) => {
          window.alert('Please upload a valid comma separated file with ');
        }
      );
  }

  csvRowAndExistingRowMerger(rowObj: any | {}) {
    this.source.getAll().then((elements: []) => {
      const rowsToDelete = elements.filter(
        (row: any) =>
          row['_id'] === rowObj['_id'] ||
          this.returneeTableService.prepareDocID(
            row['province'],
            row['district']
          ) === rowObj['_id'],
      );
      this.rowsReplacedByCsvFile = [
        ...this.rowsReplacedByCsvFile,
        ...rowsToDelete,
      ];
      rowsToDelete.forEach((rowToDelete) => this.source.remove(rowToDelete));
      this.source.prepend(rowObj);
    });
  }

  private resetFileUploader() {
    this.fileImportInput.nativeElement.value = '';
    this.isFileLoaded = false;
  }

  resetHandler($event: any) {
    $event.preventDefault();
    this.resetFileUploader();
    this.uploadInstruction = CSV_UPLOAD_INSTR;
    this.rowsFromCsvFile.forEach((row) => this.source.remove(row));
    this.rowsReplacedByCsvFile.forEach((row) => this.source.prepend(row));
  }

  uploadDownloadHandler($event: any) {
    $event.preventDefault();
    this.uploadInstruction = CSV_UPLOAD_INSTR;
    try {
      if (!this.isFileLoaded) {
        this.returneeTableService.getCsvDataFile();
        return;
      }
      this.returneeService.addAll(
        this.rowsFromCsvFile.map(row => this.returneeTableService.prepareDoc(row)),
      );
      // TODO show addAll progress using db EventEmitter's 'complete' event
      this.isFileLoaded = false;
      this.fileImportInput.nativeElement.value = '';
    } catch (error) {
      // TODO report the docs that failed to insert as a list under the file upload card
    }
  }

  onAddConfirm(event: any) {
    try {
      this.returneeTableService.saveTableRowAddition(event.newData);
      event.confirm.resolve();
    } catch (error) {
      event.confirm.reject();
    }
  }

  onEditConfirm(event: any) {
    try {
      this.returneeTableService.saveTableRowChanges(event.data, event.newData);
      event.confirm.resolve();
    } catch (error) {
      event.confirm.reject();
    }
  }

  // Potential use for floating map component showing district/municipality/ward preview
  // (userRowSelect)="onUserRowSelect($event)"
  // onUserRowSelect(event: any) {
  // }

  onDeleteConfirm(event: any) {
    if (window.confirm('Confirm Returnee record deletion:')) {
      this.returneeTableService.saveTableRowDeletion(event.data);
      event.confirm.resolve();
    } else {
      event.confirm.reject();
    }
  }
}
