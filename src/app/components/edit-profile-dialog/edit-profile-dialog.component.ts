import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../../interfaces/user.interface';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { ProfileService } from '../../services/profile.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-edit-profile-dialog',
  templateUrl: './edit-profile-dialog.component.html',
  styleUrls: ['./edit-profile-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatCheckboxModule, MatCardModule, MatDialogModule
  ]
})
export class EditProfileDialogComponent {
  editForm: FormGroup;
  isSaving = false;
  imagePreview: string | null = null;
  hidePassword = true;
  fileToUpload: File | null = null;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    public dialogRef: MatDialogRef<EditProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {
    this.editForm = this.fb.group({
      name: [data.name, [Validators.required]],
      email: [data.email, [Validators.required, Validators.email]],
      matricule: [data.matricule, [Validators.required]],
      group: [data.group, [Validators.required]],
      phone: [data.phone],
      password: ['', [Validators.minLength(6)]],
      notificationsEnabled: [data.notificationsEnabled || false],
      termsAccepted: [data.termsAccepted || false, [Validators.requiredTrue]]
    });

    // Load existing image if available
    if (data.imageUrl) {
      this.imagePreview = data.imageUrl;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.fileToUpload = file;

      // Create image preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imagePreview = null;
    this.fileToUpload = null;
  }

  async onSave() {
    if (this.editForm.invalid || this.isSaving) return;
    this.isSaving = true;

    try {
      const formData = new FormData();
      formData.append('name', this.editForm.value.name);
      formData.append('email', this.editForm.value.email);
      formData.append('matricule', this.editForm.value.matricule);
      formData.append('group', this.editForm.value.group);
      formData.append('phone', this.editForm.value.phone || '');
      formData.append('notificationsEnabled', this.editForm.value.notificationsEnabled);
      formData.append('termsAccepted', this.editForm.value.termsAccepted);

      if (this.editForm.value.password) {
        formData.append('password', this.editForm.value.password);
      }

      if (this.fileToUpload) {
        formData.append('image', this.fileToUpload);
      }

      const result = await lastValueFrom(
        this.profileService.updateProfile(formData)
      );
      this.dialogRef.close(result);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      this.isSaving = false;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}