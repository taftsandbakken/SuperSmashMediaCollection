import { Component, OnInit } from '@angular/core';

import { AmplifyService } from 'aws-amplify-angular';
import amplify from '../aws-exports';

interface HTMLInputEvent extends Event {
    target: HTMLInputElement & EventTarget;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
 	public fileListText = '(Loading files from AWS)';
 	public files = [];
 	public selectedFile: any = {};
    public totalFileSize = 0;

 	private debugMode = false;
 	private downloadElement: HTMLAnchorElement;
 	private inputElement: HTMLInputElement;
 	
 	public readonly DEFAULT_PREVIEW_URL = 'https:///vignette.wikia.nocookie.net/tlos-huggers/images/5/5e/Default.png/revision/20160816122116';
 	public readonly DEFAULT_VIDEO_URL = 'http:///chittagongit.com//images/play-icon-transparent-background/play-icon-transparent-background-9.jpg';
 	private readonly FILE_PUBLIC_URL_PREFIX = 'https://s3-us-west-2.amazonaws.com/' + amplify.aws_user_files_s3_bucket + '/public/';
 	private readonly VALID_IMAGE_SUFFIX = ['png', 'jpg', 'jpeg'];

	constructor(
	public amplifyService: AmplifyService
	) {
		this.amplifyService = amplifyService;
        this.getFileList();
	}

	ngOnInit() {
		this.inputElement = document.getElementById('file-input') as HTMLInputElement;
		this.downloadElement = document.getElementById('download-link') as HTMLAnchorElement;
		this.updateChangeEventOnInputElement();
	}

	public getFileList() {
		const self = this;
        this.amplifyService.storage().list('')
        .then(function(result) {
        	self.totalFileSize = 0;
        	for (let i = 0; i < result.length; i++) {
        		result[i].publicUrl = self.FILE_PUBLIC_URL_PREFIX + result[i].key;
        		result[i].defaultPreviewUrl = self.getDefaultPreviewUrl(result[i].key);
        		result[i].isVideo = result[i].key.split('.').pop().toLowerCase() === 'mp4';
        		self.totalFileSize += result[i].size;
        	}
        	self.files = result;
        	self.setFileListText();
        	self.consoleLog('Get List Success', result);
        }).catch(function(err) {
        	self.consoleLog('Get list error', err);
        });
	}

	public findSmashMedia() {
		this.inputElement.click();
		this.amplifyService.analytics().record('Find Smash Media Button Clicked');
	}

	public downloadSmashMedia() {
		this.downloadElement.download = this.selectedFile.key || this.selectedFile.name
	    this.downloadElement.href = this.selectedFile.publicUrl;
	    this.downloadElement.click();
	}

	public deleteMedia() {
		if (confirm('Are you sure you want to delete this file?')) {
			const self = this;
			this.amplifyService.storage().remove(this.selectedFile.key || this.selectedFile.name)
			.then (function(result) {
				self.selectedFile = {};
				self.getFileList();
	        	self.consoleLog('Delete success', result);
	        })
	        .catch(function(err) {
	        	self.consoleLog('Delete file error', err);
	        	alert('Failed to delete');
	        });
		}
	}

	public selectFile(file: any) {
		this.selectedFile = file;
		if (this.selectedFile.isVideo) {
			const videoMedia = document.getElementById('video-media') as HTMLVideoElement;
			if (videoMedia) {
				videoMedia.load();
			}
		}
	}

	private updateChangeEventOnInputElement() {
		const self = this;
		this.inputElement.addEventListener('change', function(evt: HTMLInputEvent) {
			const files = evt.target.files as any;
			if (files.length > 1) {
				alert('Please select one file');
				return;
			} 

			const file = files[0];
			self.amplifyService.storage().put(file.name, file, {
	        	contentType: file.type,
	        	level: 'public'
	        })
	        .then (function(result) {
	        	self.consoleLog('Upload success', result);
	        	file.publicUrl = self.FILE_PUBLIC_URL_PREFIX + file.name;
	        	file.defaultPreviewUrl = self.getDefaultPreviewUrl(file.name);
	        	file.isVideo = file.name.split('.').pop().toLowerCase() === 'mp4';
	        	self.files.push(file);
	        	self.totalFileSize += file.size;
	        	self.setFileListText();
	        })
	        .catch(function(err) {
	        	self.consoleLog('Upload file error', err);
	        	alert('Failed to upload');
	        });
		});
	}

	private getDefaultPreviewUrl(url: string): string {
		if (!url || url.length < 4) {
			return '';
		}

		const fileSuffix = url.split('.').pop().toLowerCase();
    	if (this.VALID_IMAGE_SUFFIX.includes(fileSuffix)) {
		} else if (fileSuffix === 'mp4') {
			return this.DEFAULT_VIDEO_URL;
		} else {
			return this.DEFAULT_PREVIEW_URL;
		}
	}

	private setFileListText() {
		this.fileListText = this.files.length ? '' : '(Add files to see your list here)';
	}

	private consoleLog(title: string, obj: any) {
		if (this.debugMode) {
			console.log(title, obj);
		}
	}
}
