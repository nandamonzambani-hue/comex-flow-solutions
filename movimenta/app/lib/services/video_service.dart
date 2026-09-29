import 'package:supabase_flutter/supabase_flutter.dart';

class PlaybackUrls {
  PlaybackUrls({required this.hls, required this.thumbnail});
  final String hls;
  final String thumbnail;
}

class VideoLockedException implements Exception {}

/// Pede à Edge Function uma URL assinada do Cloudflare Stream.
/// O vídeo nunca fica público: sem token válido, a Cloudflare recusa a reprodução.
class VideoService {
  static Future<PlaybackUrls> playback(String videoId) async {
    try {
      final res = await Supabase.instance.client.functions.invoke('stream-token', body: {'videoId': videoId});
      final data = res.data as Map<String, dynamic>;
      return PlaybackUrls(hls: data['hls'] as String, thumbnail: data['thumbnail'] as String);
    } on FunctionException catch (e) {
      if (e.status == 402) throw VideoLockedException();
      rethrow;
    }
  }
}
