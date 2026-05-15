package com.dennisturco.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.dennisturco.dto.UserRequestDTO;
import com.dennisturco.enums.ContractTypeEnum;
import com.dennisturco.enums.CustomerTypeEnum;
import com.dennisturco.enums.ProductStatusEnum;
import com.dennisturco.enums.QuotationStatusEnum;
import com.dennisturco.model.ContractType;
import com.dennisturco.model.CustomerType;
import com.dennisturco.model.ProductStatus;
import com.dennisturco.model.QuotationStatus;
import com.dennisturco.repository.ContractTypeRepository;
import com.dennisturco.repository.CustomerTypeRepository;
import com.dennisturco.repository.ProductStatusRepository;
import com.dennisturco.repository.QuotationStatusRepository;
import com.dennisturco.service.UserService;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserService userService;
    private final CustomerTypeRepository customerTypeRepository;
    private final ContractTypeRepository contractTypeRepository;
    private final ProductStatusRepository productStatusRepository;
    private final QuotationStatusRepository quotationStatusRepository;

    @SuppressWarnings("null")
    @Bean
    public CommandLineRunner initDefaultUser() {
        return args -> {
            if (userService.existsByUsername("admin")) return;
            UserRequestDTO user = UserRequestDTO.builder().name("Admin").surname("Admin").username("admin").email("admin@gmail.com").password("asdasd123").build();
            userService.registerUser(user);
        };
    }

    @Bean
    public CommandLineRunner initCustomerTypes() {
        return args -> {
            for (CustomerTypeEnum type : CustomerTypeEnum.values()) {
                customerTypeRepository
                    .findByName(type)
                    .orElseGet(() ->
                        customerTypeRepository.save(new CustomerType(null, type))
                    );
            }
        };
    }

    @Bean
    public CommandLineRunner initContractTypes() {
        return args -> {
            for (ContractTypeEnum type : ContractTypeEnum.values()) {
                contractTypeRepository
                    .findByName(type)
                    .orElseGet(() ->
                        contractTypeRepository.save(new ContractType(null, type))
                    );
            }
        };
    }

    @Bean
    public CommandLineRunner initProductStatuses() {
        return args -> {
            for (ProductStatusEnum type : ProductStatusEnum.values()) {
                productStatusRepository
                    .findByName(type)
                    .orElseGet(() ->
                        productStatusRepository.save(new ProductStatus(null, type))
                    );
            }
        };
    }

    @Bean
    public CommandLineRunner initQuotationStatuses() {
        return args -> {
            for (QuotationStatusEnum type : QuotationStatusEnum.values()) {
                quotationStatusRepository
                    .findByName(type)
                    .orElseGet(() ->
                        quotationStatusRepository.save(new QuotationStatus(null, type))
                    );
            }
        };
    }
}
