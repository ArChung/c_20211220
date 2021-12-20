//main.js file
import Swiper from '../../node_modules/swiper/swiper-bundle.min.js';
import $ from "jquery";
import ChungTool from "./libs/ChungTool"
// import Swiper from 'swiper';
// // import Swiper styles
// import 'swiper/css';

let swiper;

$(function (){
    initSwiper();
    initLang();

    gsap.from('.s4 .pp3',{
      autoAlpha: 0,
      repeat:-1,
      yoyo:true
    })
})


function initLang(){
  $(".zh-btn").on('click',(e)=>{
    $('.mainContainer').removeClass('en')
    swiper.slideNext()
  })

  $(".en-btn").on('click',(e)=>{
    $('.mainContainer').addClass('en')
    swiper.slideNext()
  })
}
function initSwiper(){
    swiper = new Swiper('.swiper', {
      
        // If we need pagination
        pagination: {
          el: '.swiper-pagination',
        },
      
        // Navigation arrows
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },

        on:{
          transitionStart: ()=>{
            console.log(4526);
          },
          init: ()=>{
            gsap.set('.s1 .aniel',{
              autoAlpha: 1,
            })
            gsap.from('.s1 .aniel',{
              autoAlpha: 0,
              y: "+=30",
              stagger: 0.2,
            })
          },
          slideChangeTransitionEnd: ()=>{
            console.log(swiper.slides[swiper.activeIndex]);  
            const page = $(swiper.slides[swiper.activeIndex]);
            gsap.set('.aniel',{
              autoAlpha: 0,
            })


            gsap.set(page.find('.aniel'),{
              autoAlpha: 1,
            })
            gsap.from(page.find('.aniel'),{
              autoAlpha: 0,
              y: "+=30",
              stagger: 0.1,
            })

          },
        }
      });
}