import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { ProfileService } from '../../services/profile.service';
import { User } from '../../interfaces/user.interface';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-edit-profileadmin-dialog',
  templateUrl: './edit-profileadmin-dialog.component.html',
  styleUrls: ['./edit-profileadmin-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatCheckboxModule, MatCardModule, MatDialogModule
  ]
})
export class EditProfileadminDialogComponent {
  editForm: FormGroup;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    public dialogRef: MatDialogRef<EditProfileadminDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {
    this.editForm = this.fb.group({
      name: [data.name, [Validators.required]],
      email: [data.email, [Validators.required, Validators.email]],
      role: [data.role, [Validators.required]],
      status: [data.status || 'active', [Validators.required]]
    });
  }

  async onSave() {
    if (this.editForm.invalid || this.isSaving) return;
    this.isSaving = true;

    try {
      const updatedUser = { ...this.data, ...this.editForm.value };
      const result = await lastValueFrom(
        this.profileService.updateProfile(updatedUser)
      );
      this.dialogRef.close(result);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      this.isSaving = false;
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}