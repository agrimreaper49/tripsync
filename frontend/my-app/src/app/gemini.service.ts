import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Observable, from, of } from 'rxjs';
import { map, tap, switchMap, catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

interface ApiResponse {
  geminiApiKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private genAI!: GoogleGenerativeAI;
  private geminiApiKey: string = '';

  constructor(private http: HttpClient) {
    this.loadGeminiApiKey().subscribe(apiKey => {
      this.geminiApiKey = apiKey;
      this.genAI = new GoogleGenerativeAI(this.geminiApiKey);
    });
  }

  private loadGeminiApiKey(): Observable<string> {
    return this.http.get<ApiResponse>(`${environment.apiUrl}`).pipe(
      map(response => response.geminiApiKey),
      catchError(error => {
        console.error('Error fetching API key:', error);
        return of(''); 
      })
    );
  }

  getDestinationRecommendations(count: number, searchTerm: string = ''): Observable<any[]> {
    if (!this.geminiApiKey) {
      return of([]); // Return an empty array if the API key is not available yet
    }
    console.log('Gemini API Key loaded:', this.geminiApiKey); // Add this line


    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    let prompt = `Generate ${count} unique travel destination recommendations. Return the response as a raw JSON array of objects, without any markdown formatting such as json, this is very important. Each object should have 'name', 'description', and 'image' properties.`;
    if (searchTerm) {
      prompt += ` Focus on destinations related to "${searchTerm}".`;
    }
    prompt += ` For each destination, provide a name, a brief description, and a relevant image URL. Format the response (remember no markdown) as a JSON array of objects with 'name', 'description', and 'image' properties.`;

    return from(model.generateContent(prompt)).pipe(
      tap(result => {
        console.log('Raw LLM output:', result.response.text());
      }),
      map(result => {
        const content = result.response.text();
        try {
          return JSON.parse(content);
        } catch (error) {
          console.error('Error parsing LLM output as JSON:', error);
          console.log('LLM output that caused the error:', content);
          throw error;
        }
      })
    );
  }
}
