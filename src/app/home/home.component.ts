import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

export interface Section {
  name: string;
  desc: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(public auth_service: AuthService) { }

  ngOnInit(): void {
  }

  apps: Section[] = [
    {
      name: 'Gestor de Turmas',
      desc: 'Acesso ao app student-group.',
    },
    {
      name: 'Gestor de Assessments',
      desc: 'Acesso ao app personality-data.',
    },
    {
      name: 'Gestor de Comunicação',
      desc: 'Acesso ao app cx-automation.',
    },
  ];

}
