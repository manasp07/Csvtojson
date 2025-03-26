import csv
import random
import faker

fake = faker.Faker()

csv_filename = "users_data.csv"


num_records = 10000


with open(csv_filename, mode="w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    
   
    writer.writerow(["id", "first_name", "middle_name", "last_name", "age", "address", "additional_info"])

 
    for i in range(1, num_records + 1):
        first_name = fake.first_name()
        middle_name = fake.first_name() if random.random() > 0.5 else ""  
        last_name = fake.last_name()
        age = random.randint(18, 60)  
        address = fake.address().replace("\n", ", ")  
        additional_info = fake.sentence(nb_words=10)  

       
        writer.writerow([i, first_name, middle_name, last_name, age, address, additional_info])

print(f"CSV file '{csv_filename}' with {num_records} records generated successfully!")
