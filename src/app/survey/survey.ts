import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SuccessPopup } from './success-popup/success-popup';

@Component({
  selector: 'app-survey',
  standalone: true,
  imports: [CommonModule, HttpClientModule, SuccessPopup],
  templateUrl: './survey.html',
  styleUrls: ['./survey.css']
})
export class Survey {
  private http = inject(HttpClient);
  statusMessage = '';
  isSubmitting = false;
  responseStatus: number | null = null;
  responseBody: any = null;
  isSuccess = false;
  showSuccessPopup = false;

  onPopupClose(): void {
    this.showSuccessPopup = false;
    this.isSubmitting = false;
  }

  onSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const fd = new FormData(form);

    // Convert FormData to a regular object (handles multi-value keys)
    const data: Record<string, any> = {};
    fd.forEach((value, key) => {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    });

    const url = 'https://1skby5qnzg.execute-api.us-east-1.amazonaws.com/prod/post-survey';

    // POST JSON to the external endpoint with explicit headers
    this.isSubmitting = true;
    this.responseStatus = null;
    this.responseBody = null;
    this.isSuccess = false;
    
    this.http.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      observe: 'response'  // This allows us to see the full response including status
    }).subscribe({
      next: (response) => {
        this.responseStatus = response.status;
        this.responseBody = response.body;
        this.isSuccess = true;
        this.statusMessage = 'Survey submitted successfully! Thank you for your feedback.';
        this.showSuccessPopup = true;
        try { form.reset(); } catch {}
        this.isSubmitting = false;
      },
      error: (err) => {
        this.isSubmitting = false;
        this.responseStatus = err.status;
        this.responseBody = err.error;
        
        if (err.status === 0) {
          console.error('CORS error or network failure', err);
          this.statusMessage = 'Unable to connect to the server. Please check your connection and try again.';
        } else {
          console.error('Survey submission failed', err);
          this.statusMessage = `Submission failed (${err.status}): ${err.error?.message || 'Please try again.'}`;
        }
      }
    });
  }
}
