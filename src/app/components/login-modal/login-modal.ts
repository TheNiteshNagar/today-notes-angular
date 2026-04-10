import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../models';
import { LucideAngularModule, NotebookPen, ArrowRight } from 'lucide-angular';

@Component({
  selector: 'app-login-modal',
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.scss'
})
export class LoginModalComponent {
  submitted = output<User>();
  name = '';
  role = '';

  readonly NotebookIcon = NotebookPen;
  readonly ArrowRightIcon = ArrowRight;

  submit(): void {
    if (this.name.trim() && this.role.trim()) {
      this.submitted.emit({ name: this.name.trim(), role: this.role.trim() });
    }
  }
}
