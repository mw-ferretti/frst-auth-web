import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  @Input() error: string | null;

  constructor(public auth_service: AuthService) {
    this.error = null;
    auth_service.checkLoggedIn();
  }

  ngOnInit(): void {
  }

  public form: FormGroup = new FormGroup({
    username: new FormControl(''),
    password: new FormControl(''),
  });

  submit() {
    if (this.form.valid) {
        this.auth_service.login(this.form.value.username, this.form.value.password);
    }
  }

}
