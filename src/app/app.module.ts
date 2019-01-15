import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AmplifyAngularModule, AmplifyService } from 'aws-amplify-angular';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
  	AmplifyAngularModule,
    BrowserModule
  ],
  providers: [
  	AmplifyService
  ],
  bootstrap: [
  	AppComponent
  ]
})
export class AppModule { }
