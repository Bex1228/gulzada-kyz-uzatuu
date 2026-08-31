import{useEffect,useRef,useState}from'react';import HeroSection from'./components/HeroSection';import InvitationSection from'./components/InvitationSection';import PoemSection from'./components/PoemSection';import HostsSection from'./components/HostsSection';import CalendarSection from'./components/CalendarSection';import VenueSection from'./components/VenueSection';import CountdownSection from'./components/CountdownSection';import FooterSection from'./components/FooterSection';import MusicButton from'./components/MusicButton';

export default function App(){
  const audio=useRef<HTMLAudioElement>(null);
  const scrollFrame=useRef<number|null>(null);
  const scrollTimeout=useRef<number|null>(null);
  const autoScrolling=useRef(false);
  const[playing,setPlaying]=useState(false);
  const[opened,setOpened]=useState(false);

  function stopAutoScroll(){
    if(scrollTimeout.current!==null){
      window.clearTimeout(scrollTimeout.current);
      scrollTimeout.current=null;
    }
    if(scrollFrame.current!==null){
      cancelAnimationFrame(scrollFrame.current);
      scrollFrame.current=null;
    }
    autoScrolling.current=false;
  }

  useEffect(()=>{
    const stop=()=>{
      if(autoScrolling.current||scrollTimeout.current!==null)stopAutoScroll();
    };
    window.addEventListener('touchstart',stop,{passive:true});
    window.addEventListener('pointerdown',stop,{passive:true});
    window.addEventListener('wheel',stop,{passive:true});
    window.addEventListener('keydown',stop);
    return()=>{
      window.removeEventListener('touchstart',stop);
      window.removeEventListener('pointerdown',stop);
      window.removeEventListener('wheel',stop);
      window.removeEventListener('keydown',stop);
      stopAutoScroll();
    };
  },[]);

  function startFullPageScroll(){
    stopAutoScroll();
    const start=window.scrollY;
    const destination=Math.max(0,document.documentElement.scrollHeight-window.innerHeight);
    const distance=destination-start;
    if(distance<=0)return;

    // Very slow cinematic journey through the complete invitation.
    // Roughly 80–110 seconds depending on the full page height.
    const duration=Math.min(110000,Math.max(80000,distance*14));
    const started=performance.now();
    autoScrolling.current=true;

    const ease=(t:number)=>t<.08?.5*Math.pow(t/.08,2)*.08:t>.92?1-.5*Math.pow((1-t)/.08,2)*.08:.04+(t-.08)*(.92/.84);

    const step=(now:number)=>{
      if(!autoScrolling.current)return;
      const progress=Math.min((now-started)/duration,1);
      window.scrollTo(0,start+distance*ease(progress));
      if(progress<1)scrollFrame.current=requestAnimationFrame(step);
      else{
        scrollFrame.current=null;
        autoScrolling.current=false;
      }
    };

    scrollFrame.current=requestAnimationFrame(step);
  }

  async function playMusic(){
    const el=audio.current;
    if(!el)return;
    el.volume=.9;
    try{await el.play();setPlaying(true)}catch{setPlaying(false)}
  }

  async function toggle(){
    const el=audio.current;
    if(!el)return;
    if(el.paused)await playMusic();
    else{el.pause();setPlaying(false)}
  }

  async function open(){
    if(opened)return;
    setOpened(true);
    const el=audio.current;
    if(el){el.currentTime=0;await playMusic()}
    scrollTimeout.current=window.setTimeout(()=>{
      scrollTimeout.current=null;
      startFullPageScroll();
    },1400);
  }

  return <main className="invitationShell">
    <audio ref={audio} src="/music/music.mp3" preload="auto" loop playsInline onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} onError={()=>setPlaying(false)}/>
    <MusicButton playing={playing} onClick={toggle}/>
    <HeroSection opened={opened} onOpen={open}/>
    <InvitationSection/><PoemSection/><HostsSection/><CalendarSection/><VenueSection/><CountdownSection/><FooterSection/>
  </main>
}
