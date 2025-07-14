import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss'],
    standalone: false
})
export class ModalComponent {
  @Input() note: any;

  newNote = {
    description: '',
    state: 'TODO',
    
  };

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    if (this.note) {
      this.newNote = { ...this.note }; // Inicializa os campos com os dados da nota
    }
  }

  closeModal() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  saveNote() {
    this.modalCtrl.dismiss(this.newNote, 'save');
  }
}
