import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastController } from '@ionic/angular';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
    standalone: false
})
export class LoginPage {
  apiUrl: string = 'https://mobile-api-one.vercel.app/api';
  username: string = '';
  password: string = '';

  constructor(private router: Router, private http: HttpClient, private toastController: ToastController) {}

  async login() {
    const headers = new HttpHeaders({
      Authorization: `Basic ${btoa(`${this.username}:${this.password}`)}`,
    });

    try {
      await this.http.get(`${this.apiUrl}/travels`, { headers }).toPromise();
      // Save credentials and navigate to the home page
      localStorage.setItem('username', this.username);
      localStorage.setItem('password', this.password);
      this.presentToast('Login bem sucedido!', 'success');
      this.router.navigate(['/home']);
    } catch {
      this.presentToast('Credenciais erradas. Tente outra vez.', 'danger');
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }
}
