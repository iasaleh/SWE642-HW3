import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Survey {
  id: number;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  surveyDate: string;
  likes: string;
  interestSource: string;
  recommend: string;
  comments: string;
  created_at: string;
}

@Component({
  selector: 'app-update-survey',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-survey.html',
  styleUrls: ['./update-survey.css']
})
export class UpdateSurvey implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private surveys: Survey[] = [];
  
  displayedSurveys: Survey[] = [];
  loading = false;
  error: string | null = null;
  baseUrl = 'https://1skby5qnzg.execute-api.us-east-1.amazonaws.com/prod/get-survey';
  updateUrl = 'https://1skby5qnzg.execute-api.us-east-1.amazonaws.com/prod/update-survey';
  hasMore = true;
  
  editingSurveyId: number | null = null;
  editedSurvey: Partial<Survey> = {};
  
  readonly likeOptions = ['Students', 'Location', 'Campus', 'Atmosphere', 'Dorm Rooms', 'Sports'];
  selectedLikes: string[] = [];
  
  private readonly batchSize = 10;
  private proxyNumbers = Array.from({ length: 20 }, (_, i) => i + 1);
  private currentProxyIndex = 0;
  private isInitialLoad = true;

  constructor() {
    console.log('UpdateSurvey component constructed');
  }

  ngOnInit() {
    console.log('UpdateSurvey component initialized');
    this.loadSurveys();
    this.cdr.markForCheck();
  }

  ngOnDestroy() {
    console.log('UpdateSurvey component being destroyed');
    this.surveys = [];
    this.displayedSurveys = [];
    this.currentProxyIndex = 0;
    this.loading = false;
    this.hasMore = true;
    this.error = null;
  }

  private loadSurveys() {
    console.log('Loading surveys, current state:', {
      loading: this.loading,
      surveysCount: this.surveys.length,
      displayedCount: this.displayedSurveys.length
    });
    
    this.surveys = [];
    this.displayedSurveys = [];
    this.currentProxyIndex = 0;
    this.hasMore = true;
    this.loading = false;
    this.isInitialLoad = true;
    this.fetchNextBatch();
  }

  fetchNextBatch() {
    if (this.loading || !this.hasMore) return;
    
    this.loading = true;
    this.error = null;
    this.tryNextProxy();
  }

  private tryNextProxy() {
    if (this.currentProxyIndex >= this.proxyNumbers.length) {
      this.loading = false;
      this.error = `Loaded ${this.surveys.length} survey(s).`;
      this.updateDisplayedSurveys();
      this.cdr.markForCheck();
      return;
    }

    const proxyNumber = this.proxyNumbers[this.currentProxyIndex];
    console.log('Trying proxy number:', proxyNumber);
    
    this.http.get<Survey[]>(`${this.baseUrl}/${proxyNumber}`, { observe: 'response' }).subscribe({
      next: (response) => {
        if (response.status === 200 && response.body) {
          if (Array.isArray(response.body) && response.body.length > 0) {
            console.log(`Received ${response.body.length} surveys from proxy ${proxyNumber}`);
            const newSurveys = response.body.filter(newSurvey => 
              !this.surveys.some(existingSurvey => existingSurvey.id === newSurvey.id)
            );
            if (newSurveys.length > 0) {
              this.surveys.push(...newSurveys);
            }
          }
          this.currentProxyIndex++;
          this.tryNextProxy();
        } else {
          this.currentProxyIndex++;
          this.tryNextProxy();
        }
      },
      error: (err) => {
        console.log(`Error from proxy ${proxyNumber}:`, err.status);
        if (err.status === 404) {
          this.currentProxyIndex++;
          this.tryNextProxy();
        } else {
          console.error('Error fetching surveys:', err);
          this.currentProxyIndex++;
          this.tryNextProxy();
        }
      }
    });
  }

  private updateDisplayedSurveys() {
    console.log('Updating displayed surveys');
    const sortedSurveys = [...this.surveys].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    const displayCount = this.isInitialLoad ? this.batchSize : this.displayedSurveys.length;
    this.displayedSurveys = sortedSurveys.slice(0, displayCount);
    this.hasMore = sortedSurveys.length > this.displayedSurveys.length;
    
    if (this.isInitialLoad) {
      this.isInitialLoad = false;
    }
    
    console.log('Display update complete:', {
      totalSurveys: this.surveys.length,
      displayedSurveys: this.displayedSurveys.length,
      hasMore: this.hasMore,
      isInitialLoad: this.isInitialLoad
    });
    
    this.cdr.markForCheck();
  }

  loadMore() {
    const sortedSurveys = [...this.surveys].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const nextBatchSize = this.displayedSurveys.length + this.batchSize;
    this.displayedSurveys = sortedSurveys.slice(0, nextBatchSize);
    this.hasMore = sortedSurveys.length > this.displayedSurveys.length;
  }

  startEdit(survey: Survey) {
    this.editingSurveyId = survey.id;
    this.editedSurvey = { ...survey };
    // Initialize selected likes from the survey's likes string
    this.selectedLikes = survey.likes ? survey.likes.split(',').map(l => l.trim()) : [];
  }

  cancelEdit() {
    this.editingSurveyId = null;
    this.editedSurvey = {};
    this.selectedLikes = [];
  }

  saveEdit() {
    if (!this.editingSurveyId || !this.editedSurvey) {
      return;
    }

    // Convert selected likes array to comma-separated string
    this.editedSurvey.likes = this.selectedLikes.join(', ');
    
    // Make sure ID is included in the update
    const updateData = { ...this.editedSurvey, id: this.editingSurveyId };
    
    this.loading = true;
    this.error = null;

    console.log('Sending update request with data:', updateData);

    // Try POST instead of PUT, as some APIs don't support PUT
    this.http.post<{ statusCode: number; body: string }>(this.updateUrl, JSON.stringify(updateData), {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
      .subscribe({
        next: (response) => {
          console.log('Survey updated successfully:', response);
          
          // Update the survey in the local array
          const index = this.surveys.findIndex(s => s.id === this.editingSurveyId);
          if (index !== -1) {
            this.surveys[index] = this.editedSurvey as Survey;
          }
          
          // Update displayed surveys
          this.updateDisplayedSurveys();
          
          this.editingSurveyId = null;
          this.editedSurvey = {};
          this.loading = false;
          this.error = 'Survey updated successfully!';
          this.cdr.markForCheck();
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.error = null;
            this.cdr.markForCheck();
          }, 3000);
        },
        error: (err) => {
          console.error('Error updating survey:', err);
          console.error('Error details:', {
            message: err.message,
            status: err.status,
            statusText: err.statusText,
            url: err.url,
            error: err.error
          });
          
          this.loading = false;
          
          // Provide more specific error message
          if (err.status === 0) {
            this.error = 'CORS error: Unable to connect to server. Please check if CORS is properly configured.';
          } else if (err.status === 404) {
            this.error = 'Update endpoint not found. Please verify the URL.';
          } else if (err.status >= 500) {
            this.error = 'Server error occurred. Please try again later.';
          } else {
            this.error = `Failed to update survey: ${err.message}`;
          }
          
          this.cdr.markForCheck();
        }
      });
  }

  isEditing(id: number): boolean {
    return this.editingSurveyId === id;
  }

  toggleLike(like: string) {
    const index = this.selectedLikes.indexOf(like);
    if (index > -1) {
      this.selectedLikes.splice(index, 1);
    } else {
      this.selectedLikes.push(like);
    }
  }

  isLikeSelected(like: string): boolean {
    return this.selectedLikes.includes(like);
  }
}
