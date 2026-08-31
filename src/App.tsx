import{useRef,useState}from'react';import HeroSection from'./components/HeroSection';import InvitationSection from'./components/InvitationSection';import PoemSection from'./components/PoemSection';import HostsSection from'./components/HostsSection';import CalendarSection from'./components/CalendarSection';import VenueSection from'./components/VenueSection';import CountdownSection from'./components/CountdownSection';import FooterSection from'./components/FooterSection';import MusicButton from'./components/MusicButton';

export default function App(){
  const audio=useRef<HTMLAudioElement>(null);
  const shouldPlay=useRef(false);
  const[playing,setPlaying]=useState(false);
  const[opened,setOpened]=useState(false);

  function smoothScrollToInvitation(){
    const target=document.getElementById('invitation');
    if(!target)return;
    const start=window.scrollY;
    const destination=start+target.getBoundingClientRect().top;
    const distance=destination-start;
    const duration=2200;
    const started=performance.now();
    const ease=(t:number)=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
    const step=(now:number)=>{
      const progress=Math.min((now-started)/duration,1);
      window.scrollTo(0,start+distance*ease(progress));
      if(progress<1)requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  async function startMusic(){
    const el=audio.current;
    if(!el)return;
    shouldPlay.current=true;
    el.volume=.9;
    try{await el.play();setPlaying(true)}catch{setPlaying(false)}
  }

  async function toggle(){
    const el=audio.current;
    if(!el)return;
    if(!el.paused){
      shouldPlay.current=false;
      el.pause();
      setPlaying(false);
    }else{
      await startMusic();
    }
  }

  async function open(){
    if(opened)return;
    setOpened(true);
    const el=audio.current;
    if(el)el.currentTime=0;
    await startMusic();
    window.setTimeout(smoothScrollToInvitation,900);
  }

  function recoverPlayback(){
    const el=audio.current;
    if(!el||!shouldPlay.current||el.ended)return;
    window.setTimeout(()=>{
      if(shouldPlay.current&&el.paused){
        el.play().then(()=>setPlaying(true)).catch(()=>{});
      }
    },120);
  }

  return <main className="invitationShell">
    <audio
      ref={audio}
      src="/music/music.mp3"
      preload="auto"
      loop
      onPlay={()=>setPlaying(true)}
      onPause={()=>{setPlaying(false);recoverPlayback()}}
      onStalled={recoverPlayback}
      onCanPlay={recoverPlayback}
    />
    <MusicButton playing={playing} onClick={toggle}/>
    <HeroSection opened={opened} onOpen={open}/>
    <InvitationSection/>
    <PoemSection/>
    <HostsSection/>
    <CalendarSection/>
    <VenueSection/>
    <CountdownSection/>
    <FooterSection/>
  </main>
}
