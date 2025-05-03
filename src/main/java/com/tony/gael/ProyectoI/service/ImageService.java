package com.tony.gael.ProyectoI.service;

import com.tony.gael.ProyectoI.model.Image;
import com.tony.gael.ProyectoI.repo.ImageRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class ImageService {
    private final ImageRepo imageRepo;

    @Autowired
    public ImageService(ImageRepo imageRepo) {
        this.imageRepo = imageRepo;
    }

    public Image saveImage(Image image) {
        return imageRepo.save(image);
    }

    public List<Image> getAllImages() {
        return imageRepo.findAll();
    }

    public Image getImageById(Long id) {
        return imageRepo.findById(id).orElseThrow(() -> new RuntimeException("Image not found"));
    }

    public Image updateImage(Long id, Image image) {
        if (imageRepo.existsById(id)) {
            image.setImage_id(id);
            return imageRepo.save(image);
        } else {
            throw new RuntimeException("Image not found");
        }
    }

    public void deleteImage(Long id) {
        if (imageRepo.existsById(id)) {
            imageRepo.deleteById(id);
        } else {
            throw new RuntimeException("Image not found");
        }
    }
}
