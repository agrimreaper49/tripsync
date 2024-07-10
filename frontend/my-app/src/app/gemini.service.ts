import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Observable, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    console.log(environment.geminiApiKey); // Test to make sure it works
    this.genAI = new GoogleGenerativeAI(environment.geminiApiKey);
  }

  getDestinationRecommendations(count: number, searchTerm: string = ''): Observable<any[]> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    
    let prompt = `Generate ${count} unique travel destination recommendations. Return the response as a raw JSON array of objects, without any markdown formatting such as json, this is very important. Each object should have 'name', 'description', and 'image' properties.`;    if (searchTerm) {
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