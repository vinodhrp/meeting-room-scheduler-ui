import { Component, OnInit, PipeTransform, ViewChild, ElementRef } from '@angular/core';
import { BookingService } from 'src/app/_service/booking.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Room } from 'src/app/_model/room.model';
import { RoomService } from 'src/app/_service/room.service';
import { Booking } from 'src/app/_model/booking.model';
import { DateTimeFormatPipe } from "../../date-time-format-pipe"
import { Subscription } from 'rxjs';
import { ConstantService } from 'src/app/_service/constant.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { ErrorHandlerService } from 'src/app/_service/error-handler.service';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.scss']
})
export class SearchFormComponent implements OnInit {
  roomList: Room[];
  minDate: Date;
  maxDate: Date;
  selectedDate: any;
  currentHour: any;
  currentMinutes: any;
  currentTime = "00:00 am";
  currentMinutesRemainder: any;
  minToTime: any;
  fromState: boolean = true;
  toState: boolean = true;
  searchClick: boolean;
  roomId: number;
  ftime: any;
  searchForm: FormGroup;
  bookingFailedMesg: string;
  subscription: Subscription;
  bookingSuccessMsg: String;
  showSuccess: boolean;
  fullName: String;
  usrEmpId: number;
  errorThrown: boolean;
  fTime: any;
  toTime: any;
  bookingForm: FormGroup;
  formFieldValues: Booking;
  errorMsg: any;
  successMsg: any;
  cDate: any;
  blueTheme:any;

  @ViewChild('ft', { static: true }) FT: ElementRef;
  @ViewChild('tt', { static: true }) TT: ElementRef;
  @ViewChild('dt', { static: true }) DATE: ElementRef;
  @ViewChild('purpose', { static: true }) PURPOSE: ElementRef;
  @ViewChild('rId', { static: true }) ID: ElementRef;




  constructor(private service: BookingService, private formBuilder: FormBuilder, private roomService: RoomService,
    private cons: ConstantService, private router: Router, private route: ActivatedRoute,
    private errorHandler: ErrorHandlerService, private spinner: NgxSpinnerService) {

    this.searchForm = this.formBuilder.group({});
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentDay = new Date().getDate();
    this.minDate = new Date(currentYear, currentMonth, currentDay);
    this.maxDate = new Date(currentYear, currentMonth, currentDay + 6);
    this.currentHour = new Date().getHours();
    this.currentMinutes = new Date().getMinutes();
    this.currentMinutesRemainder = this.currentMinutes % 5;

  }

  ngOnInit(): void {
    this.fullName = localStorage.getItem(this.cons.fullName);
    this.usrEmpId = Number(localStorage.getItem(this.cons.userId));
    this.roomService.getAllRooms().subscribe(rooms => {
      this.roomList = rooms;
    })

  }

  calculateDate(date) {
    let asim = new DateTimeFormatPipe(date);
    this.fromState = false;
    this.FT.nativeElement.value = "";
    this.TT.nativeElement.value = "";

    let da = asim.transform2(new Date().toLocaleDateString());
    if (date.value == da) {
      if (this.currentHour < 12) {
        if (this.currentMinutes > 55) {
          this.currentTime = ((this.currentHour) + 1) + ":00 am";
        } else {
          this.currentTime = (this.currentHour) + ":" + (this.currentMinutes + (5 - this.currentMinutesRemainder)) + " am";
        }
      } else if (this.currentHour === 12) {
        if (this.currentMinutes > 55) {
          this.currentTime = "1:00 pm";
        } else {
          this.currentTime = (this.currentHour) + ":" + (this.currentMinutes + (5 - this.currentMinutesRemainder)) + " pm";
        }
      } else {
        if (this.currentMinutes > 55) {
          this.currentTime = (this.currentHour) + 1 + ":00 pm";
        } else {
          this.currentTime = (this.currentHour) + ":" + (this.currentMinutes + (5 - this.currentMinutesRemainder)) + " pm";
        }
      }
    }
    else {
      this.currentTime = "00:00 am";
    }
  }

  calculateTime(time): string {
    if (time.length > 0) {
      if (time.substr(time.length - 2) == "PM") {
        if (time.substr(0, time.indexOf(":")) != "12") {
          return time = (12 + parseInt(time.substr(0, time.indexOf(':')))) + ":" + time.substr(time.indexOf(':') + 1, 2) + ":00"
        }
        else {
          return time = time.substr(0, time.length - 3) + ":00"
        }
      } else {
        if (time.substr(0, time.indexOf(':')).length === 2) {
          return (time.substr(0, time.length - 3) + ":00");
        }
        else {
          return ("0" + time.substr(0, time.length - 3) + ":00");
        }
      }
    }
  }



  fetchBookedData(roomId: any, date: any, fTime: any, toTime: any, reason: any) {
    this.spinner.show();
    this.errorMsg = '';
    this.successMsg = '';
    fTime = fTime.value;
    toTime = toTime.value;
    date = date.value;
    reason = reason.value;
    roomId = roomId.value;

    this.errorMsg = "";
    let asim = new DateTimeFormatPipe(date);
    var bookDate = asim.transform(date);
    fTime = this.calculateTime(fTime);
    toTime = this.calculateTime(toTime);

    let searchInfo = new Booking(roomId, this.usrEmpId, this.fullName, bookDate, fTime, toTime, reason);
    this.service.getAllLists(searchInfo).subscribe(
      data => (this.handleSearchData(data), this.spinner.hide()),
      error => (this.handleError(error), this.spinner.hide())
    )
  }






  handleSearchData(data: Booking[]) {
    if (data.length > 0) {
      this.service.changeMessage(data);
    } else {
      this.service.changeMessage([]);
    }
  }




  bookRoom(roomId: any, date: any, fTime: any, toTime: any, reason: any) {
    
    this.errorMsg = '';
    this.successMsg = '';
    fTime = fTime.value;
    toTime = toTime.value;
    date = date.value;
    reason = reason.value;
    roomId = roomId.value;
    if (fTime == "" || toTime == "" || date == "" || roomId == "0") {
      this.errorMsg = "All Fields are mandatory";
    }
    else {
      this.spinner.show();
      this.errorMsg = "";
      let asim = new DateTimeFormatPipe(date);
      var bookDate = asim.transform(date);
      fTime = this.calculateTime(fTime);
      toTime = this.calculateTime(toTime);

      let bookingDetail = new Booking(roomId, this.usrEmpId, this.fullName, bookDate, fTime, toTime, reason);

      this.service.bookRoom(bookingDetail)
        .subscribe(
          data => (this.handleBookedRoomData(data, bookingDetail), this.spinner.hide()
          ),
          err => (this.handleError(err), this.spinner.hide())

        )


    }
  }
  handleBookedRoomData(data: any, bookingDetail: Booking) {
    if (data.status == 200) {
      this.bookingSuccessMsg = "Booked Successfully !!!";
      this.showSuccess = true;

      this.successMsg = data.message ? data.message : this.bookingSuccessMsg
      this.service.getAllLists(bookingDetail).subscribe(data => {
        if (data.length > 0) {
          this.service.changeMessage(data);
        } else {
          this.service.changeMessage([]);
        }

      });
      setTimeout(() => {
        this.showSuccess = false; this.successMsg = "";
      }, 2500);
    }
  }


  handleError(err: HttpErrorResponse) {
    this.errorMsg = '';
    this.successMsg = '';
    this.errorMsg = err.message ? err.message : 'Something went wrong';
    setTimeout(() => {
      this.errorMsg = false;
    }, 2500);
  }

  reset() {
    this.spinner.show();
    window.location.reload();
  }

  setMinToTime(minute: HTMLInputElement) {
    let selectedTime = (minute.value);
    let maxHour = parseInt(selectedTime.substr(0, selectedTime.indexOf(':')));
    let maxMinute = parseInt(selectedTime.substr(selectedTime.indexOf(':') + 1, 3)) + 15;
    let type = selectedTime.substr(selectedTime.length - 2);
    if (maxMinute >= 60) {
      maxMinute -= 60;
      maxHour += 1;
      if (maxHour === 12) {
        if (type === "pm") {
          type = "am";
        }
        else {
          type = "pm"
        }
      }
    }
    this.minToTime = maxHour + ":" + maxMinute + " " + type;
    this.toState = false;

  }
}
