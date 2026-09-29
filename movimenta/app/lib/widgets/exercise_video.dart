import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

import '../services/video_service.dart';

/// Reproduz o vídeo de um exercício via HLS (Cloudflare Stream), com URL assinada.
class ExerciseVideo extends StatefulWidget {
  const ExerciseVideo({super.key, required this.videoId, this.autoplay = true, this.onLocked});
  final String videoId;
  final bool autoplay;
  final VoidCallback? onLocked;

  @override
  State<ExerciseVideo> createState() => _ExerciseVideoState();
}

class _ExerciseVideoState extends State<ExerciseVideo> {
  VideoPlayerController? _controller;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void didUpdateWidget(covariant ExerciseVideo old) {
    super.didUpdateWidget(old);
    if (old.videoId != widget.videoId) {
      _controller?.dispose();
      _controller = null;
      _error = null;
      _load();
    }
  }

  Future<void> _load() async {
    try {
      final urls = await VideoService.playback(widget.videoId);
      final c = VideoPlayerController.networkUrl(Uri.parse(urls.hls));
      await c.initialize();
      await c.setLooping(true);
      await c.setVolume(0);
      if (widget.autoplay) await c.play();
      if (!mounted) {
        await c.dispose();
        return;
      }
      setState(() => _controller = c);
    } on VideoLockedException {
      widget.onLocked?.call();
      if (mounted) setState(() => _error = 'Vídeo exclusivo para assinantes');
    } catch (_) {
      if (mounted) setState(() => _error = 'Não foi possível carregar o vídeo');
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = _controller;
    return AspectRatio(
      aspectRatio: c?.value.aspectRatio ?? 16 / 9,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: Container(
          color: Colors.black,
          child: _error != null
              ? Center(
                  child: Text(_error!, style: const TextStyle(color: Colors.white70)),
                )
              : c == null
              ? const Center(child: CircularProgressIndicator(color: Colors.white))
              : GestureDetector(
                  onTap: () => setState(() => c.value.isPlaying ? c.pause() : c.play()),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      VideoPlayer(c),
                      if (!c.value.isPlaying) const Icon(Icons.play_circle_fill, size: 64, color: Colors.white70),
                    ],
                  ),
                ),
        ),
      ),
    );
  }
}
