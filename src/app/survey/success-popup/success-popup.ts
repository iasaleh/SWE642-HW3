import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="show" class="popup-overlay">
      <div class="popup-content">
        <div class="success-icon">✅</div>
        <h2>Success!</h2>
        <p>{{ message }}</p>
        <div class="status-info" *ngIf="showStatus">
          <p><strong>Status:</strong> {{ status }}</p>
        </div>
        <button (click)="onClose.emit()">Close</button>
      </div>
    </div>
  `,
  styles: [`
    .popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .popup-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 400px;
      width: 90%;
      animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .success-icon {
      font-size: 48px;
      margin-bottom: 1rem;
    }
    h2 {
      color: #2e7d32;
      margin: 0 0 1rem 0;
    }
    p {
      margin: 0 0 1rem 0;
      color: #333;
    }
    .status-info {
      background: #f5f5f5;
      padding: 0.5rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
    button {
      background: #2e7d32;
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: background 0.2s;
    }
    button:hover {
      background: #1b5e20;
    }
  `]
})
export class SuccessPopup {
  @Input() show = false;
  @Input() message = '';
  @Input() status: number | null = null;
  @Input() showStatus = true;
  @Output() onClose = new EventEmitter<void>();
}