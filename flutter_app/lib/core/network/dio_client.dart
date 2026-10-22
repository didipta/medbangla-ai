import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../config/app_config.dart';
import '../error/exceptions.dart';
import '../storage/secure_storage_service.dart';

class DioClient {
  final Dio dio;
  final SecureStorageService storage;

  DioClient({required this.storage, Dio? customDio})
    : dio =
          customDio ??
          Dio(
            BaseOptions(
              baseUrl: AppConfig.apiBaseUrl,
              connectTimeout: AppConfig.connectTimeout,
              receiveTimeout: AppConfig.receiveTimeout,
              sendTimeout: AppConfig.sendTimeout,
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
            ),
          ) {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await storage.getToken();
          if (token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          if (kDebugMode) {
            debugPrint('🌐 [DIO REQ] ${options.method} ${options.uri}');
          }
          return handler.next(options);
        },
        onResponse: (response, handler) {
          if (kDebugMode) {
            debugPrint(
              '✅ [DIO RES] ${response.statusCode} ${response.requestOptions.uri}',
            );
          }
          return handler.next(response);
        },
        onError: (DioException error, handler) {
          if (kDebugMode) {
            debugPrint(
              '❌ [DIO ERR] ${error.response?.statusCode} ${error.message}',
            );
          }
          return handler.next(error);
        },
      ),
    );
  }

  /// Maps DioException to domain-level exceptions
  Exception handleDioError(DioException error) {
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.sendTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.connectionError) {
      return NetworkException(
        'সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। (Connection Timeout)',
      );
    }

    final statusCode = error.response?.statusCode;
    if (statusCode == 401 || statusCode == 403) {
      return UnauthorizedException(
        'অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে পুনরায় লগইন করুন।',
      );
    }

    final errorData = error.response?.data;
    String message = 'সার্ভার ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
    if (errorData is Map && errorData['detail'] != null) {
      message = errorData['detail'].toString();
    } else if (errorData is Map && errorData['error'] != null) {
      final err = errorData['error'];
      message = err is Map ? (err['message'] ?? message) : err.toString();
    }

    return ServerException(message, statusCode: statusCode);
  }
}
