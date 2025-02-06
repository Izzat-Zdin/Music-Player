import { createEffect, createSignal, onCleanup } from "solid-js";

const AudioPlayer = () => {
  const [audio] = createSignal(new Audio());
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [currentTime, setCurrentTime] = createSignal(0);
  const [duration, setDuration] = createSignal(0);
  const [volume, setVolume] = createSignal(50);
  const [audioSrc, setAudioSrc] = createSignal("/song.mp3"); // Default song

  createEffect(() => {
    const audioEl = audio();
    audioEl.src = audioSrc();
    audioEl.volume = volume() / 100;

    audioEl.onloadedmetadata = () => setDuration(audioEl.duration);
    audioEl.ontimeupdate = () => setCurrentTime(audioEl.currentTime);
    audioEl.onended = () => setIsPlaying(false);

    return onCleanup(() => {
      audioEl.pause();
      audioEl.src = "";
    });
  });

  const togglePlay = () => {
    const audioEl = audio();
    if (isPlaying()) {
      audioEl.pause();
    } else {
      audioEl.play();
    }
    setIsPlaying(!isPlaying());
  };

  const changeVolume = (event) => {
    const vol = event.target.value;
    setVolume(vol);
    audio().volume = vol / 100;
  };

  const seek = (event) => {
    const newTime = event.target.value;
    audio().currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAudioSrc(URL.createObjectURL(file));
      setIsPlaying(false); // Reset playback
    }
  };

  return (
    <div class="player">
      <h2>🎵 SolidJS Audio Player</h2>

      <input type="file" accept="Raya.mp3" onChange={handleFileUpload} />
      
      <div>
        <button onClick={togglePlay}>{isPlaying() ? "⏸ Pause" : "▶ Play"}</button>
      </div>

      <input type="range" min="0" max={duration()} value={currentTime()} onInput={seek} />
      <span>{Math.floor(currentTime())} / {Math.floor(duration())} sec</span>

      <div>
        <label>🔊 Volume:</label>
        <input type="range" min="0" max="100" value={volume()} onInput={changeVolume} />
      </div>
    </div>
  );
};

export default AudioPlayer;
