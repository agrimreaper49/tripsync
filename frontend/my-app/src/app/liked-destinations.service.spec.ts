import { TestBed } from '@angular/core/testing';

import { LikedDestinationsService } from './liked-destinations.service';

describe('LikedDestinationsService', () => {
  let service: LikedDestinationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LikedDestinationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
