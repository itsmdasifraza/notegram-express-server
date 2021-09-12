import { Component, OnInit, Output } from '@angular/core';
import { EventEmitter } from 'protractor';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, Validators } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ChatService } from 'src/app/user/services/chat/chat.service';

@Component({
  selector: 'app-create-chat',
  templateUrl: './create-chat.component.html',
  styleUrls: ['./create-chat.component.css']
})
export class CreateChatComponent implements OnInit {


  location = window.location.href;
  constructor(private appService: AppService, private chatService : ChatService, private router : Router,private titleService:Title, private meta: Meta) {
    this.titleService.setTitle("Create New Notes | Chat Notes");
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ name: 'keywords', content: `chat notes, chatnotes, md asif raza` });
    this.meta.updateTag({ name: 'description', content: `Fill your notes in the form below. topic contains heading and notes contain description.` });
    this.meta.updateTag({ property: "og:url", content: `${this.location}` });
    this.meta.updateTag({ property:"og:type", content:"website" });
    this.meta.updateTag({ property: "og:title", content: `Create New Notes | Chat Notes` });
    this.meta.updateTag({ property: "og:description", content: `Fill your notes in the form below. topic contains heading and notes contain description.`});
    this.meta.updateTag({ property: "og:image", content: `https://www.chatnotes.mdasifraza.com/assets/logo/featured_logo.png` });
    this.meta.updateTag({ property:"og:image:secure_url", content: `https://www.chatnotes.mdasifraza.com/assets/logo/featured_logo.png`});

   }


  chatForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),

  });

  ngOnInit(): void {
      this.appService.navtoggle.next(false);
  }

  

  error = false;
  spinner : boolean = false;
  
  createChat(){
    if(this.chatForm.valid){
      this.spinner = true;
      this.error = false;
        // console.log(this.chatForm.value);
        let chat = {
          "title" : this.chatForm.value.title,
         "description" : this.chatForm.value.description
        } 
        
        this.chatService.createChat(chat).subscribe(
          (res)=>{
            // console.log("res",res);
            this.spinner = false;
            this.chatForm.reset();
            this.router.navigate(["/chat"]);

          },(err)=>{
            // console.log("err",err);
            this.spinner = false;
            this.error = err.error.mssg;
        });
    }
  }

  ngOnDestroy(): void {
    this.appService.navtoggle.next(true);
    
}
}
