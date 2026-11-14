from ffd_ai import build_search_docs, generate_implications, generate_summaries


def main():
    generate_summaries.generate()
    generate_implications.generate()
    build_search_docs.build()


if __name__ == "__main__":
    main()
