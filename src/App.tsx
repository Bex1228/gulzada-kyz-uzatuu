import{useRef,useState}from'react';import HeroSection from'./components/HeroSection';import InvitationSection from'./components/InvitationSection';import PoemSection from'./components/PoemSection';import HostsSection from'./components/HostsSection';import CalendarSection from'./components/CalendarSection';import VenueSection from'./components/VenueSection';import CountdownSection from'./components/CountdownSection';import FooterSection from'./components/FooterSection';import MusicButton from'./components/MusicButton';

export default function App(){
  const audio=useRef<HTMLAudioElement>(null);
  const scrollFrame=useRef<number|null>(null);
  const[playing,setPlaying]=useState(false);
  const[opened,setOpened]=useState(false);

  function startFullPageScroll(){
    if(scrollFrame.current!==null)cancelAnimationFrame(scrollFrame.current);

    const start=window.scrollY;
    const destination=Math.max(0,document.documentElement.scrollHeight-window.innerHeight);
    const distance=destination-start;
    if(distance<=0)return;

    // Slow cinematic scroll through the entire invitation.
    // Duration adapts to page height but stays deliberately slow.
    const duration=Math.min(70000,Math.max(45000,distance*9));
    const started=performance.now();

    const ease=(t:number)=>{
      if(t<.08)return .5*Math.pow(t/.08,2)*.08;
      if(t>.92){
        const x=(1-t)/.08;
        return 1-.5*x*x*.08;
      }
      return .04+(t-.08)*(0.92/.84);
    };

    const step=(now:number)=>{
      const progress=Math.min((now-started)/duration,1);
      window.scrollTo(0,start+distance*ease(progress));
      if(progress<1)scrollFrame.current=requestAnimationFrame(step);
      else scrollFrame.current=null;
    };

    scrollFrame.current=requestAnimationFrame(step);
  }

  async function playMusic(){
    const el=audio.current;
    if(!el)return;
    el.volume=.9;
    try{
      await el.play();
      setPlaying(true);
    }catch{
      setPlaying(false);
    }
  }

  async function toggle(){
    const el=audio.current;
    if(!el)return;
    if(el.paused){
      await playMusic();
    }else{
      el.pause();
      setPlaying(false);
    }
  }

  async function open(){
    if(opened)return;
    setOpened(true);

    const el=audio.current;
    if(el){
      el.currentTime=0;
      await playMusic();
    }

    // Let the envelope opening animation breathe, then begin the slow
    // automatic journey from the top of the invitation to the very bottom.
    window.setTimeout(startFullPageScroll,1400);
  }

  return <main className="invitationShell">
    <audio
      ref={audio}
      src="/music/music.mp3"
      preload="auto"
      loop
      playsInline
      onPlay={()=>setPlaying(true)}
      onPause={()=>setPlaying(false)}
      onEnded={()=>setPlaying(false)}
      onError={()=>setPlaying(false)}
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
