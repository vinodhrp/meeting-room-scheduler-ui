
import { Component, OnInit, ɵConsole, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/_service/auth.service';
import { OAuth } from 'src/app/_model/o-auth.model';
import { Login } from 'src/app/_model/login';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { MessageService } from 'src/app/_service/message.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  modelLogin = new Login(null, null);

  loginErrorMsg: String;
  showError: boolean;

  regSuccessMsg: String;
  showSuccess: boolean;
  subscription: Subscription;
  messages: any[] = [];

  loginForm = new FormGroup({
    Username: new FormControl('', [Validators.required, this.noWhitespaceValidator]),
    Password: new FormControl('', [Validators.required, this.noWhitespaceValidator])
  });


  constructor(private authService: AuthService,
              private router: Router,
              private messageService: MessageService) {
    // subscribe to home component messages
    console.log('Constructor ........')
    
  }

  ngOnInit(): void {
    console.log('Login Onnit.....')
    var isLogged = this.authService.isAuthenticated();
    if (isLogged) {
      this.router.navigate(["/booking"]);
      return;
    }

    this.subscription = this.messageService.getMessage().subscribe(message => {
      console.log('mess : ' +message)
      if (message) {
        this.messages.push(message);
        console.log('Messages : ' +this.messages)
      } else {
        // clear messages when empty message received
        this.messages = [];
        console.log('in else')
      }
    });

    //this.router.navigate(["/login"]);
  }

  onSubmit1(heroForm): void {
    console.log('onsubmit');
    console.log(this.UserName.value);
    console.log(this.Password.value);
  }


  onSubmit(form: any) {//of Type NgForm
    // this.loginForm.markAllAsTouched();
    this.authService.aunthenticate(this.UserName.value, this.Password.value)
      .subscribe(
        data => (this.redirecToDashBoard(data)),
        err => {
          console.log('Bad Credentials........', err)
          this.handleInvalidLogin(err);
        }
      )
  }

  redirecToDashBoard(oauth: OAuth) {
    console.log('Login Success with User Id ........', this.UserName.value)
    if (this.authService.isAuthenticated) {
      this.router.navigate(["/booking"]);
    } else {
      this.router.navigate(["/login"]);
    }
  }

  handleInvalidLogin(err: HttpErrorResponse) {
    this.showError = true;
    this.loginErrorMsg = 'Bad Credentials !!! ';
    this.router.navigate(["/login"]);
  }

  get UserName() {
    return this.loginForm.get('Username');
  }

  get Password() {
    return this.loginForm.get('Password');
  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }



  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    //this.showSuccess = false;
    //this.subscription.unsubscribe();
  }

}