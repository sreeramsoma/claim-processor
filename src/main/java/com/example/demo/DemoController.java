package com.example.demo;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.view.RedirectView;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ResponseEntity;
import org.apache.poi.EncryptedDocumentException;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;


@RestController
public class DemoController {
    private final Gson gson = new GsonBuilder().setPrettyPrinting().create();
    private List<MyDataObject> li;
    private String fileName;
    private final String uploadDir = "/Users/soma/Downloads/upload/";

    public DemoController() {
        this.li = new ArrayList<>();
    }

    @RequestMapping("/404")
    public String handle404() {
        return "404"; // Return a specific error view for 404 errors
    }

    @PostMapping("/update")
    public ResponseEntity<String> updateCache(@RequestBody Map<String, Object> payload) {
        System.out.println(payload);
        try {
            int age = Integer.parseInt(payload.get("age").toString());
            double salary = Double.parseDouble(payload.get("salary").toString());
            int index = Integer.parseInt(payload.get("row").toString()) - 1;
            MyDataObject obj = this.li.get(index);
            obj.age = age;
            obj.salary = salary;
            return ResponseEntity.ok("Update successful");
        } catch (NumberFormatException | IndexOutOfBoundsException e) {
            throw new IndexOutOfBoundsException("Unable to find entity for payload: " + payload.toString()); // Let the global exception handler deal with these exceptions
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage(), e); // Let the global exception handler deal with other exceptions
        }
    }

    @GetMapping("/getRecord")
    @ResponseBody // This annotation tells Spring to treat the return value as the response body
    public MyDataObject getRecord(@RequestParam("row") int row) {
        MyDataObject rec;
        try {
            rec = li.get(row - 1);
            rec.numrows = li.size();
        } catch (IndexOutOfBoundsException e) {
            // Handle index out of bounds error, or return an error response
            return null; // Or throw an exception, return an error object, etc.
        }
        return rec;
    }

    @GetMapping("/downloadExcel")
    public ResponseEntity<ByteArrayResource> downloadExcel() throws IOException {
        updateExcel();
        byte[] excelBytes = Files.readAllBytes(Paths.get(this.uploadDir + fileName));

        ByteArrayResource resource = new ByteArrayResource(excelBytes);

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment;filename=" + fileName)
                .contentType(org.springframework.http.MediaType.parseMediaType("application/vnd.ms-excel"))
                .contentLength(excelBytes.length)
                .body(resource);
    }

    public void updateExcel() {

        String inputFile = this.uploadDir + this.fileName;
        File file = new File(inputFile); // Use the correct variable name

        // Check if the file exists before attempting to open it
        if (!file.exists()) {
            System.err.println("File not found: " + inputFile);
            return; // Handle the error appropriately (e.g., throw an exception, log an error, etc.)
        }
        FileInputStream fis;
        try {
            fis = new FileInputStream(file);
        } catch (FileNotFoundException e) {
            System.err.println("File not found: " + inputFile);
            return; // Handle the error appropriately (e.g., throw an exception, log an error, etc.)

        }
        try (Workbook workbook = WorkbookFactory.create(fis)) {
            Sheet sheet = workbook.getSheetAt(0); // Assuming data is on the first sheet

            for (MyDataObject obj : li) {
                Row row = sheet.getRow(obj.row + 2); // Adjust for 0-based index and header rows
                if (row != null) {
                    row.getCell(1).setCellValue(obj.name);
                    row.getCell(2).setCellValue(obj.age);
                    row.getCell(3).setCellValue(obj.salary);
                } else {
                    // Handle missing row or create a new one
                }
            }

            // Save the changes back to the Excel file
            try (FileOutputStream fos = new FileOutputStream(inputFile)) {
                workbook.write(fos);
            }
        } catch (IOException | EncryptedDocumentException e) {
            e.printStackTrace(); // Handle the exception appropriately
        }
    }

    @GetMapping("/")
    public String index() {
        return "index"; // This assumes your index.html file is in src/main/resources/static/
    }

    @PostMapping("/upload")
    public RedirectView uploadExcel(@RequestParam("file") MultipartFile file) {

        // List<MyDataObject> objects = new ArrayList<>();

        String tmpFileName = file.getOriginalFilename();

        try {

            java.nio.file.Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            // Check if the upload directory exists, create it if necessary
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Save the file to the upload directory
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, uploadPath.resolve(tmpFileName), StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            e.printStackTrace();
            // Handle file upload error
            return new RedirectView("/errorPage", true);
        }

        int n = 0;
        li = new ArrayList<MyDataObject>();
        int r = 0;
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            this.fileName = file.getOriginalFilename();
            Sheet sheet = workbook.getSheetAt(0); // Assuming data is on the first sheet
            Iterator<Row> rows = sheet.rowIterator();
            // Assuming data starts from the second row (index 1) and columns are fixed
            // (name, age, salary)

            while (rows.hasNext()) {
                Row row = rows.next();

                ++n;

                if (n < 4) // skip the tab name and header
                    continue;

                // row 1 - table name n = 1
                // row 2 - the header n = 2
                // row 4 - data. n = 4

                if (row != null) {
                    String name = row.getCell(1).getStringCellValue(); // the cells start from index 1
                    if (name.isEmpty())
                        break;
                    int age = (int) row.getCell(2).getNumericCellValue();
                    double salary = row.getCell(3).getNumericCellValue();

                    li.add(new MyDataObject(name, age, salary, r + 1));
                    r = r + 1;
                }
            }
        } catch (IOException e) {
            e.printStackTrace(); // Handle the exception appropriately
            // return "Error occurred while processing the Excel file.";
            return new RedirectView("/errorPage", true);
        }

        // return st;
        // return gson.toJson(li) + "\n"; // Convert objects list to JSON
        String encodedString = null;
        try {
            MyDataObject rec = li.get(0);
            rec.numrows = r;
            encodedString = URLEncoder.encode(gson.toJson(li.get(0)), StandardCharsets.UTF_8.toString());
        } catch (UnsupportedEncodingException e) {

        }

        String redirectUrl = "/something.html?jsonData=" + encodedString;
        System.out.println(gson.toJson(li.get(0)));
        return new RedirectView(redirectUrl, true);
    }

    class MyDataObject {
        public String name;
        public int age;
        public double salary;
        public int row;
        public int numrows;

        public MyDataObject(String name, int age, double salary, int row) {
            this.row = row;
            this.name = name;
            this.age = age;
            this.salary = salary;
        }
    }

}
