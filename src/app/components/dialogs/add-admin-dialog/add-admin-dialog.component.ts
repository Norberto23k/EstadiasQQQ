import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from 'src/app/services/admin.service';
import { User } from 'src/app/interfaces/user.interface';
import { lastValueFrom } from 'rxjs';
import { ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-add-admin-dialog',
  templateUrl: './add-admin-dialog.component.html',
  styleUrls: ['./add-admin-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatCheckboxModule, MatProgressSpinnerModule
  ]
})
export class AddAdminDialogComponent {
  adminForm: FormGroup;
  isSaving = false;
  private toastCtrl = inject(ToastController);

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    public dialogRef: MatDialogRef<AddAdminDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { editMode: boolean, admin?: User }
  ) {
    this.adminForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      matricule: [''],
      phone: ['']
    });

    if (data.editMode && data.admin) {
      this.adminForm.patchValue({
        name: data.admin.name,
        email: data.admin.email,
        matricule: data.admin.matricule,
        phone: data.admin.phone
      });
      this.adminForm.get('password')?.clearValidators();
      this.adminForm.get('password')?.updateValueAndValidity();
    }
  }

  async onSubmit() {
    if (this.adminForm.invalid || this.isSaving) return;
    this.isSaving = true;

    try {
      const formValue = this.adminForm.value;
      
      if (this.data.editMode && this.data.admin) {
        // Update existing admin (without password)
        const updatedAdmin: User = {
          ...this.data.admin,
          name: formValue.name,
          email: formValue.email,
          matricule: formValue.matricule,
          phone: formValue.phone,
          role: 'admin' // Ensure role remains admin
        };
        const result = await lastValueFrom(this.adminService.updateAdmin(updatedAdmin));
        this.dialogRef.close(result);
      } else {
        // Create new admin user
        const newUser: Omit<User, 'id'> & { password: string } = {
          name: formValue.name,
          email: formValue.email,
          password: formValue.password,
          role: 'admin',
          matricule: formValue.matricule,
          phone: formValue.phone,
          termsAccepted: true,
          status: 'active',
          notificationsEnabled: true
        };
        
        const result = await lastValueFrom(this.adminService.createUser(newUser));
        this.dialogRef.close(result);
      }
    } catch (error) {
      console.error('Error saving admin:', error);
      const toast = await this.toastCtrl.create({
        message: 'Error processing admin',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.isSaving = false;
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}