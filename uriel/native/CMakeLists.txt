cmake_minimum_required(VERSION 3.16)
project(uriel_native CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# URIEL_SANITIZE: "" | address | thread
set(URIEL_SANITIZE "" CACHE STRING "Sanitizer to build tests with")

find_package(OpenSSL REQUIRED)
find_package(Threads REQUIRED)

add_compile_options(-Wall -Wextra -Wpedantic -Werror -D_GNU_SOURCE)
if(URIEL_SANITIZE STREQUAL "address")
    add_compile_options(-fsanitize=address,undefined -fno-omit-frame-pointer -fno-sanitize-recover=all)
    add_link_options(-fsanitize=address,undefined)
elseif(URIEL_SANITIZE STREQUAL "thread")
    add_compile_options(-fsanitize=thread)
    add_link_options(-fsanitize=thread)
endif()

enable_testing()

function(uriel_test name)
    add_executable(${name} ${name}.cpp)
    target_link_libraries(${name} PRIVATE OpenSSL::Crypto Threads::Threads)
    add_test(NAME ${name} COMMAND ${name} ${CMAKE_CURRENT_BINARY_DIR})
    # secure_buffer_test espera que el proceso hijo muera por SIGSEGV en la página guarda:
    # los sanitizers no deben interceptar esa señal.
    set_tests_properties(${name} PROPERTIES
        ENVIRONMENT "ASAN_OPTIONS=handle_segv=0:detect_leaks=1;TSAN_OPTIONS=handle_segv=0:halt_on_error=1"
        TIMEOUT 120)
endfunction()

uriel_test(secure_buffer_test)
uriel_test(audit_log_test)
