import{useEffect,useRef,useState}from'react';
import HeroSection from'./components/HeroSection';
import InvitationSection from'./components/InvitationSection';
import PoemSection from'./components/PoemSection';
import HostsSection from'./components/HostsSection';
import CalendarSection from'./components/CalendarSection';
import VenueSection from'./components/VenueSection';
import CountdownSection from'./components/CountdownSection';
import FooterSection from'./components/FooterSection';
import MusicButton from'./components/MusicButton';

const AUTO_SCROLL_DELAY_MS=1800;
const AUTO_SCROLL_SPEED_PX_PER_SECOND=40;
const EASE_EDGE=.03;

export default function App(){
  const audioRef=useRef<HTMLAudioElement>(null);
  const scrollFrameRef=useRef<number|null>(null);
  const scrollTimeoutRef=useRef<number|null>(null);
  const autoScrollActiveRef=useRef(false);
  const userCancelledScrollRef=useRef(false);
  const previousScrollBehaviorRef=useRef('');
  const[playing,setPlaying]=useState(false);
  const[opened,setOpened]=useState(false);

  function removeCancelListeners(){
    window.removeEventListener('touchstart',cancelAutoScroll);
    window.removeEventListener('touchmove',cancelAutoScroll);
    window.removeEventListener('pointerdown',cancelAutoScroll);
    window.removeEventListener('mousedown',cancelAutoScroll);
    window.removeEventListener('wheel',cancelAutoScroll);
  }

  function addCancelListeners(){
    window.addEventListener('touchstart',cancelAutoScroll,{passive:true});
    window.addEventListener('touchmove',cancelAutoScroll,{passive:true});
    window.addEventListener('pointerdown',cancelAutoScroll,{passive:true});
    window.addEventListener('mousedown',cancelAutoScroll,{passive:true});
    window.addEventListener('wheel',cancelAutoScroll,{passive:true});
  }

  function cancelAutoScroll(){
    if(!autoScrollActiveRef.current)return;
    if(scrollFrameRef.current!==null)cancelAnimationFrame(scrollFrameRef.current);
    scrollFrameRef.current=null;
    autoScrollActiveRef.current=false;
    userCancelledScrollRef.current=true;
    document.documentElement.style.scrollBehavior=previousScrollBehaviorRef.current;
    removeCancelListeners();
  }

  function finishAutoScroll(){
    scrollFrameRef.current=null;
    autoScrollActiveRef.current=false;
    document.documentElement.style.scrollBehavior=previousScrollBehaviorRef.current;
    removeCancelListeners();
  }

  function easedProgress(progress:number){
    const normalization=1-EASE_EDGE;
    if(progress<EASE_EDGE)return(progress*progress/(2*EASE_EDGE))/normalization;
    if(progress>1-EASE_EDGE)return(normalization-Math.pow(1-progress,2)/(2*EASE_EDGE))/normalization;
    return(progress-EASE_EDGE/2)/normalization;
  }

  function startAutoScroll(){
    if(userCancelledScrollRef.current)return;
    const start=window.scrollY;
    const bottom=Math.max(0,document.documentElement.scrollHeight-window.innerHeight);
    const distance=bottom-start;
    if(distance<=0)return;

    const duration=distance/AUTO_SCROLL_SPEED_PX_PER_SECOND*1000;
    const startedAt=performance.now();
    previousScrollBehaviorRef.current=document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior='auto';
    autoScrollActiveRef.current=true;
    addCancelListeners();

    const step=(now:number)=>{
      if(!autoScrollActiveRef.current)return;
      const progress=Math.min((now-startedAt)/duration,1);
      window.scrollTo(0,start+distance*easedProgress(progress));
      if(progress<1)scrollFrameRef.current=requestAnimationFrame(step);
      else finishAutoScroll();
    };

    scrollFrameRef.current=requestAnimationFrame(step);
  }

  useEffect(()=>()=>{
    if(scrollTimeoutRef.current!==null)window.clearTimeout(scrollTimeoutRef.current);
    if(scrollFrameRef.current!==null)cancelAnimationFrame(scrollFrameRef.current);
    document.documentElement.style.scrollBehavior=previousScrollBehaviorRef.current;
    removeCancelListeners();
  },[]);

  async function playMusic(){
    const audio=audioRef.current;
    if(!audio)return;
    try{await audio.play()}catch{setPlaying(false)}
  }

  async function toggleMusic(){
    const audio=audioRef.current;
    if(!audio)return;
    if(audio.paused)await playMusic();
    else audio.pause();
  }

  async function open(){
    if(opened)return;
    setOpened(true);
    await playMusic();
    scrollTimeoutRef.current=window.setTimeout(()=>{
      scrollTimeoutRef.current=null;
      startAutoScroll();
    },AUTO_SCROLL_DELAY_MS);
  }

  return <main className="invitationShell">
    <audio
      ref={audioRef}
      src="/music/music.mp3"
      preload="auto"
      loop
      playsInline
      onPlay={()=>setPlaying(true)}
      onPause={()=>setPlaying(false)}
      onEnded={()=>setPlaying(false)}
      onError={()=>setPlaying(false)}
    />
    <MusicButton playing={playing} onClick={toggleMusic}/>
    <HeroSection opened={opened} onOpen={open}/>
    <InvitationSection/><PoemSection/><HostsSection/><CalendarSection/><VenueSection/><CountdownSection/><FooterSection/>
  </main>
}
