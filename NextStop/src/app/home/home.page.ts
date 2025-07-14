import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

import {
  LoadingController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { ModalComponent } from '../modal/modal.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
    standalone: false
})
export class HomePage implements OnInit {
  apiUrl: string = 'https://mobile-api-one.vercel.app/api';
  name: string = '';
  password: string = '';

  notes: any;

  constructor(
    private alertController: AlertController,
    private modalCtrl: ModalController,
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    const storedUsername = localStorage.getItem('username');
    const storedPassword = localStorage.getItem('password');

    if (storedUsername && storedPassword) {
      this.name = storedUsername;
      this.password = storedPassword;
      await this.getNotes();
    } else {
      // Redireciona para login se as credenciais não forem encontradas
      window.location.href = '/login';
    }
  }

  async logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    window.location.href = '/login';
  }

  async getNotes() {
    const loading = await this.showLoading();

    const headers = new HttpHeaders({
      Authorization: `Basic ${btoa(`${this.name}:${this.password}`)}`,
    });

    try {
      this.notes = await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}/travels`, { headers })
      );
      loading.dismiss();
      if (this.notes.length === 0) {
        await this.presentToast(`No travel plans yet. Start planning your next adventure! ✈️`, 'warning');
      } else {
        await this.presentToast(
          `You have ${this.notes.length} travel plans ready to go! 🌎`,
          'success'
        );
      }
    } catch (error: any) {
      loading.dismiss();
      await this.presentToast(error.error, 'danger');
    }
  }

  async postNote(note: { description: string; state: string }) {
    const loading = await this.showLoading();

    const headers = new HttpHeaders({
      Authorization: `Basic ${btoa(`${this.name}:${this.password}`)}`,
    });

    try {
      await firstValueFrom(
        this.http.post(`${this.apiUrl}/travels`, note, { headers })
      );
      loading.dismiss();

      await this.presentToast('New travel plan added successfully! ✈️', 'success');
      await this.getNotes();
    } catch (error: any) {
      loading.dismiss();
      await this.presentToast(error.error || 'Failed to create travel plan', 'danger');
    }
  }

  async putNote(
    id: string,
    updatedNote: { description: string; state: string }
  ) {
    const loading = await this.showLoading();

    const headers = new HttpHeaders({
      Authorization: `Basic ${btoa(`${this.name}:${this.password}`)}`,
    });

    try {
      await firstValueFrom(
        this.http.put(`${this.apiUrl}/travels/${id}`, updatedNote, { headers })
      );
      loading.dismiss();
      await this.presentToast(`Travel plan updated successfully! 🌍`, 'success');
      await this.getNotes();
    } catch (error: any) {
      loading.dismiss();
      await this.presentToast(
        error.error || 'Failed to update travel plan',
        'danger'
      );
    }
  }

  async deleteNote(id: string) {
    const loading = await this.showLoading();

    const headers = new HttpHeaders({
      Authorization: `Basic ${btoa(`${this.name}:${this.password}`)}`,
    });

    try {
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/travels/${id}`, { headers })
      );
      loading.dismiss();

      await this.presentToast(`Travel plan removed successfully! 🌍`, 'success');
      await this.getNotes();
    } catch (error: any) {
      loading.dismiss();
      await this.presentToast(
        error.error || 'Failed to remove travel plan',
        'danger'
      );
    }
  }

  async deleteConfirmation(id: string) {
    const alert = await this.alertController.create({
      header: 'Delete Travel Plan',
      message: 'Are you sure you want to delete this travel plan?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: () => {
            this.deleteNote(id);
          },
        },
      ],
    });

    await alert.present();
  }

  async openEditModal(note: any) {
    const modal = await this.modalCtrl.create({
      component: ModalComponent,
      componentProps: { note },
      backdropDismiss: false,
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'save' && data) {
      data.id = note.id;
      await this.putNote(note.id, data);
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

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Loading...',
    });

    loading.present();

    return loading;
  }

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: ModalComponent,
      backdropDismiss: false,
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'save' && data) {
      await this.postNote(data);
    }
  }
}
