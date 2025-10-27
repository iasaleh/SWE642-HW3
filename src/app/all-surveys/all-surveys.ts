import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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
  surveyDate: string;  // format: "YYYY-MM-DD"
  likes: string;       // might be empty string
  interestSource: string;
  recommend: string;
  comments: string;    // might be empty string
  created_at: string;  // format: "YYYY-MM-DD HH:mm:ss"
}

@Component({
  selector: 'app-all-surveys',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-surveys.html',
  styleUrls: ['./all-surveys.css']
})
export class AllSurveys implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private surveys: Survey[] = [];
  
  displayedSurveys: Survey[] = [];
  loading = false;
  error: string | null = null;
  baseUrl = 'https://1skby5qnzg.execute-api.us-east-1.amazonaws.com/prod/get-survey';
  hasMore = true;
  
  private readonly batchSize = 10;
  private proxyNumbers = Array.from({ length: 20 }, (_, i) => i + 1);
  private currentProxyIndex = 0;
  private isInitialLoad = true;

  constructor() {
    console.log('AllSurveys component constructed');
  }

  ngOnInit() {
    console.log('AllSurveys component initialized');
    // Load surveys when component is activated
    this.loadSurveys();
    // Trigger change detection
    this.cdr.markForCheck();
  }

  ngOnDestroy() {
    console.log('AllSurveys component being destroyed');
    // Reset state when component is destroyed
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
    
    // Always reset state and fetch fresh data when component loads
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
      // Update display only after all proxies are processed
      this.updateDisplayedSurveys();
      // Force change detection after loading completes
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
              // Don't update display during async loading, only add to collection
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
    // Sort surveys by creation date, newest first
    const sortedSurveys = [...this.surveys].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    // On initial load, show first 10. On subsequent loads (Load More), preserve current display count
    const displayCount = this.isInitialLoad ? this.batchSize : this.displayedSurveys.length;
    this.displayedSurveys = sortedSurveys.slice(0, displayCount);
    this.hasMore = sortedSurveys.length > this.displayedSurveys.length;
    
    // Mark that initial load is complete
    if (this.isInitialLoad) {
      this.isInitialLoad = false;
    }
    
    console.log('Display update complete:', {
      totalSurveys: this.surveys.length,
      displayedSurveys: this.displayedSurveys.length,
      hasMore: this.hasMore,
      isInitialLoad: this.isInitialLoad
    });
    
    // Force change detection in zoneless mode
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
}