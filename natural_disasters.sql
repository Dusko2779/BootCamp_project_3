CREATE TABLE "natural_disasters" (
    "No" int NOT Null,
	"topic" varchar(50) NOT NULL,
    "country" varchar(50) NOT NULL,
    "index_trends" decimal(10, 2) NOT NULL,
    "year" int NOT NULL,
    "country_code" varchar(2) NOT NULL,
    CONSTRAINT "pk_natural_disasters" PRIMARY KEY ("No")
);
