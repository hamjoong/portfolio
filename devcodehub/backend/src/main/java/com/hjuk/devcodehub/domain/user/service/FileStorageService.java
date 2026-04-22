package com.hjuk.devcodehub.domain.user.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
  String uploadProfileImage(MultipartFile file);
}
