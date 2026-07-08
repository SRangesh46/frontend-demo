import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';

import { RequestModel } from 'src/app/models/RequestModel';
import { ResponseModel } from 'src/app/models/ResponseModel';
import { EncryptDecryptResponse } from 'src/app/models/response/EncryAndDecryResponse';
import { EncryptdecryptService } from 'src/app/auth/encryptdecrypt.service';
import { PostmethodService } from 'src/app/app-config/postmethod.service';
import { VideoGalleryService } from './video-gallery.service';

@Component({
  selector: 'app-video-gallery',
  templateUrl: './video-gallery.component.html',
  styleUrls: ['./video-gallery.component.css']
})
export class VideoGalleryComponent implements OnInit {
  testForm!: FormGroup;
  searchText: string = '';

  public requestModel: RequestModel = new RequestModel();
  public responseModel: ResponseModel = new ResponseModel();
  public encrydecryresponse: EncryptDecryptResponse = new EncryptDecryptResponse();

  public videoGalleryList: any = {
    latestVideo: [],
    allVideos: [],
    mostVideo: []
  };

  public getVideoCategoryList: any[] = [];
  public getDiseaseCategoryList: any[] = [];

  public selectedCategory: string = '';
  public selectedDisease: string = '';

  public isLoading: boolean = false;

  private videoPlayStates = new Map<number, { duration: number, viewed: boolean }>();
  private currentPlayingVideo: HTMLVideoElement | null = null;

  // Toggle UI buttons
  showAllLatest = false;
  showAllMostViewed = false;
  showAllVideos = false;
  selectedFilter: string = 'most-viewed'; // Default selection
showDropdowns: boolean = true;
  setFilter(filter: string): void {
    // debugger
     this.isLoading = true; // Show loader
    this.selectedFilter = filter;
    
  // Simulate a 3-second delay
  setTimeout(() => {
    this.isLoading = false; // Hide loader after 3 sec
  }, 1000);
   // Hide dropdowns if 'all-videos' is selected
  if (filter === 'all-videos') {
    this.showDropdowns = false;
  } else {
    this.showDropdowns = true;
  }
  }
  constructor(
    private toastr: ToastrService,
    private videoGalleryService: VideoGalleryService,
    private serviceMethod: PostmethodService,
    private encryptDecrypt: EncryptdecryptService,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.testForm = this.fb.group({
      selectedCategory: [''],
      selectedDisease: ['']
    });

    this.getVideoCategory();
    this.getVideoDisease();
    this.getVideoGallery(); // Load all videos initially

    // Apply filters when form changes
    this.testForm.valueChanges.subscribe(() => {
      this.getVideoGallery();
    });
  }

  sanitizeVideoUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  toggleLatest() {
    this.showAllLatest = !this.showAllLatest;
  }

  toggleMostViewed() {
    this.showAllMostViewed = !this.showAllMostViewed;
  }

  toggleAllVideos() {
    this.showAllVideos = !this.showAllVideos;
  }

  // ========== FILTERED VIDEO GETTERS ==========
  get filteredLatestVideos() {
    return (this.videoGalleryList?.latestVideo || [])
      .filter((video: any) => !!video.videoGalleryUrl)
      .filter((video: any) =>
        !this.searchText || video.videoGallery?.toLowerCase().includes(this.searchText.toLowerCase())
      );
  }

  get filteredMostViewed() {
    return (this.videoGalleryList?.mostVideo || [])
      .filter((video: any) => !!video.videoGalleryUrl)
      .filter((video: any) =>
        !this.searchText || video.videoGallery?.toLowerCase().includes(this.searchText.toLowerCase())
      );
  }

  get filteredAllVideos() {
    return (this.videoGalleryList?.allVideos || [])
      .filter((video: any) => !!video.videoGalleryUrl)
      .filter((video: any) =>
        !this.searchText || video.videoGallery?.toLowerCase().includes(this.searchText.toLowerCase())
      );
  }

  // ========== API CALL: VIDEO GALLERY ==========
  getVideoGallery(): void {
    const selectedCategory = this.testForm.get('selectedCategory')?.value;
    const selectedDisease = this.testForm.get('selectedDisease')?.value;

    // Sync form values to component state
    this.selectedCategory = selectedCategory || '';
    this.selectedDisease = selectedDisease || '';

    const requestObj = {
      videoGalleryId: null,
      categoryId: this.selectedCategory || null,
      diseaseId: this.selectedDisease || null,
      viewCount: null,
      flag: 1
    };
console.log('video Request Object:', requestObj); // Debug log
    this.requestModel = new RequestModel();
    this.encrydecryresponse = this.encryptDecrypt.encryption(requestObj);
    this.requestModel.payload = this.encrydecryresponse.data;
    this.isLoading = true;

    this.videoGalleryService.getVideoGallery(this.requestModel, this.encrydecryresponse.iv)
      .then((response: any) => {
        const encryptedData = response.body.responseData;
        const clientSecret = response.headers.get('clientsecret');

        if (!clientSecret) throw new Error('Missing clientsecret header');

        const decrypted = this.encryptDecrypt.decryption(encryptedData, clientSecret);
        const galleryData = decrypted?.data?.responseObject?.getVideoGallery;
console.log('Decrypted video gallery response:', galleryData); // Debug log
        if (decrypted?.data?.statusCode === 200 && galleryData) {
          this.videoGalleryList = {
            latestVideo: galleryData.latestVideo || [],
            mostVideo: galleryData.mostVideo || [],
            allVideos: galleryData.allVideos || []
          };
        } else {
          this.videoGalleryList = { mostVideo: [], latestVideo: [], allVideos: [] };
        }

        this.isLoading = false;
      })
      .catch(error => {
        console.error('API error:', error);
        this.videoGalleryList = { mostVideo: [], latestVideo: [], allVideos: [] };
        this.isLoading = false;
      });
  }

  // ========== CATEGORY ==========
  getVideoCategory(): void {
    const requestObj = { categoryId: null, flag: null };
    this.encrydecryresponse = this.encryptDecrypt.encryption(requestObj);
    this.requestModel.payload = this.encrydecryresponse.data;

    this.videoGalleryService.getVideoCategory(this.requestModel, this.encrydecryresponse.iv)
      .then((response: any) => {
        const encryptedData = response.body.responseData;
        const clientSecret = response.headers.get('clientsecret');
        const decrypted = this.encryptDecrypt.decryption(encryptedData, clientSecret);

        this.getVideoCategoryList = decrypted?.data?.responseObject?.getVideoCategory || [];
      })
      .catch(() => {
        this.getVideoCategoryList = [];
      });
  }

  // ========== DISEASE ==========
  getVideoDisease(): void {
    const requestObj = { diseaseId: null, flag: null };
    this.encrydecryresponse = this.encryptDecrypt.encryption(requestObj);
    this.requestModel.payload = this.encrydecryresponse.data;

    this.videoGalleryService.getVideoDisease(this.requestModel, this.encrydecryresponse.iv)
      .then((response: any) => {
        const encryptedData = response.body.responseData;
        const clientSecret = response.headers.get('clientsecret');
        const decrypted = this.encryptDecrypt.decryption(encryptedData, clientSecret);

        this.getDiseaseCategoryList = decrypted?.data?.responseObject?.getVideoDisease || [];
      })
      .catch(() => {
        this.getDiseaseCategoryList = [];
      });
  }

  // ========== VIDEO EVENTS ==========
  onPlay(event: Event, video: any): void {
    const currentVideo = event.target as HTMLVideoElement;
    if (this.currentPlayingVideo && this.currentPlayingVideo !== currentVideo) {
      this.currentPlayingVideo.pause();
    }
    this.currentPlayingVideo = currentVideo;
  }

  onMetadataLoaded(event: Event, video: any): void {
    const videoElement = event.target as HTMLVideoElement;
    const state = this.videoPlayStates.get(video.videoGalleryId) || { duration: 0, viewed: false };
    state.duration = videoElement.duration;
    this.videoPlayStates.set(video.videoGalleryId, state);
  }

  onTimeUpdate(event: Event, video: any): void {
    const videoElement = event.target as HTMLVideoElement;
    const state = this.videoPlayStates.get(video.videoGalleryId);

    if (!state || state.viewed) return;

    const currentTime = videoElement.currentTime;
    const duration = state.duration || videoElement.duration;

    if (currentTime >= duration / 2) {
      state.viewed = true;
      this.videoPlayStates.set(video.videoGalleryId, state);
      this.incrementViewCount(video.videoGalleryId);
    }
  }

  // ========== VIEW COUNT ==========
incrementViewCount(videoGalleryId: number): void {
  const requestObj = {
    videoGalleryId,
    categoryId: this.selectedCategory || null,
    diseaseId: this.selectedDisease || null,
    viewCount: 1,
    flag: 2
  };

  this.encrydecryresponse = this.encryptDecrypt.encryption(requestObj);
  this.requestModel.payload = this.encrydecryresponse.data;

  this.videoGalleryService.getVideoGallery(this.requestModel, this.encrydecryresponse.iv)
    .then((response: any) => {
      const encryptedData = response.body.responseData;
      const clientSecret = response.headers.get('clientsecret');

      if (!clientSecret) {
        console.error('Missing clientsecret header');
        return;
      }

      // 👇 FIXED: Cast to `any`
      const decrypted: any = this.encryptDecrypt.decryption(encryptedData, clientSecret);

      // ✅ Adjust the access to match actual backend structure
      const rawCount = decrypted?.data?.responseObject?.viewCount ?? 0;

      const newCount = this.extractViewNumber(rawCount.toString());
      this.updateLocalViewCount(videoGalleryId, newCount);
    })
    .catch(err => {
      console.error('View count update failed', err);
    });
}


  updateLocalViewCount(videoGalleryId: number, newCount?: number): void {
    const update = (list: any[]) => {
      const video = list.find(v => v.videoGalleryId === videoGalleryId);
      if (video) {
        video.displayViewCount = newCount ?? (video.displayViewCount || 0) + 1;
      }
    };

    update(this.videoGalleryList.latestVideo);
    update(this.videoGalleryList.mostVideo);
    update(this.videoGalleryList.allVideos);
  }

  extractViewNumber(viewCountStr: string): number {
    const match = viewCountStr?.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }
}
